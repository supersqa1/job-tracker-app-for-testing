from fastapi import Depends, Request, Response

from app.config import settings
from app.services.rate_limit import check_rate_limit


def limit_login(request: Request, response: Response) -> None:
    check_rate_limit(
        request=request,
        response=response,
        bucket_name="auth-login",
        limit=settings.rate_limit_login_per_minute,
        enabled=settings.rate_limit_enabled,
    )


def limit_register(request: Request, response: Response) -> None:
    check_rate_limit(
        request=request,
        response=response,
        bucket_name="auth-register",
        limit=settings.rate_limit_register_per_minute,
        enabled=settings.rate_limit_enabled,
    )


def limit_application_create(request: Request, response: Response) -> None:
    check_rate_limit(
        request=request,
        response=response,
        bucket_name="applications-create",
        limit=settings.rate_limit_default_per_minute,
        enabled=settings.rate_limit_enabled,
    )


def limit_demo(request: Request, response: Response) -> None:
    check_rate_limit(
        request=request,
        response=response,
        bucket_name="public-demo",
        limit=settings.rate_limit_demo_per_minute,
        enabled=settings.rate_limit_enabled,
    )


RateLimitLogin = Depends(limit_login)
RateLimitRegister = Depends(limit_register)
RateLimitApplicationCreate = Depends(limit_application_create)
RateLimitDemo = Depends(limit_demo)
