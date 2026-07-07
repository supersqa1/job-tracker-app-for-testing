from dataclasses import dataclass
from time import time

from fastapi import HTTPException, Request, Response, status


@dataclass
class RateLimitBucket:
    reset_at: int
    remaining: int


rate_limit_buckets: dict[str, RateLimitBucket] = {}


def client_identifier(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", maxsplit=1)[0].strip()
    if request.client is None:
        return "unknown"
    return request.client.host


def check_rate_limit(
    *,
    request: Request,
    response: Response,
    bucket_name: str,
    limit: int,
    window_seconds: int = 60,
    enabled: bool = True,
) -> None:
    if not enabled:
        return

    now = int(time())
    reset_at = now + window_seconds
    key = f"{bucket_name}:{client_identifier(request)}"
    bucket = rate_limit_buckets.get(key)

    if bucket is None or bucket.reset_at <= now:
        bucket = RateLimitBucket(reset_at=reset_at, remaining=limit)
        rate_limit_buckets[key] = bucket

    if bucket.remaining <= 0:
        retry_after = max(bucket.reset_at - now, 1)
        headers = {
            "X-RateLimit-Limit": str(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(bucket.reset_at),
            "Retry-After": str(retry_after),
        }
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers=headers,
        )

    bucket.remaining -= 1
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(bucket.remaining)
    response.headers["X-RateLimit-Reset"] = str(bucket.reset_at)


def clear_rate_limits() -> None:
    rate_limit_buckets.clear()
