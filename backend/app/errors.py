from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def error_payload(code: str, message: str, details: list[Any] | None = None) -> dict[str, Any]:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
        }
    }


def error_code_for_http(status_code: int, detail: Any) -> str:
    detail_text = str(detail)
    if status_code == status.HTTP_401_UNAUTHORIZED:
        if detail_text == "Token has expired" or detail_text == "API key has expired":
            return "TOKEN_EXPIRED"
        if detail_text != "Authentication required":
            return "INVALID_CREDENTIALS"
        return "AUTHENTICATION_REQUIRED"
    if status_code == status.HTTP_403_FORBIDDEN:
        return "FORBIDDEN"
    if status_code == status.HTTP_404_NOT_FOUND:
        return "NOT_FOUND"
    if status_code == status.HTTP_409_CONFLICT:
        return "DUPLICATE_RESOURCE"
    if status_code == status.HTTP_429_TOO_MANY_REQUESTS:
        return "RATE_LIMITED"
    return "HTTP_ERROR"


async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload(
            error_code_for_http(exc.status_code, exc.detail),
            str(exc.detail),
        ),
        headers=exc.headers,
    )


async def starlette_http_exception_handler(
    _: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload(
            error_code_for_http(exc.status_code, exc.detail),
            str(exc.detail),
        ),
        headers=exc.headers,
    )


async def validation_exception_handler(
    _: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    details = [
        {
            "loc": list(error.get("loc", [])),
            "msg": error.get("msg", ""),
            "type": error.get("type", ""),
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_payload(
            "VALIDATION_ERROR",
            "Request validation failed",
            details,
        ),
    )


def setup_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, starlette_http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
