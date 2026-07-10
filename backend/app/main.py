from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.errors import setup_exception_handlers
from app.routers import admin, api_keys, applications, auth, health, public, users
from app.seed import seed_demo_applications, seed_demo_users

API_V1_PREFIX = "/api/v1"
STATIC_FRONTEND_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_demo_users(db)
        seed_demo_applications(db)
    yield


app = FastAPI(
    title="SuperSQA Job Tracker API",
    description="Backend API for tracking job search applications",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)

app.include_router(health.router, prefix="/api")
app.include_router(health.router, prefix=API_V1_PREFIX)
app.include_router(public.router, prefix=API_V1_PREFIX)
app.include_router(auth.router, prefix=API_V1_PREFIX)
app.include_router(users.router, prefix=API_V1_PREFIX)
app.include_router(admin.router, prefix=API_V1_PREFIX)
app.include_router(api_keys.router, prefix=API_V1_PREFIX)
app.include_router(applications.router, prefix=API_V1_PREFIX)


def packaged_frontend_available() -> bool:
    return (STATIC_FRONTEND_DIR / "index.html").is_file()


def resolve_frontend_file(path: str) -> Path | None:
    requested_path = (STATIC_FRONTEND_DIR / path).resolve()
    static_root = STATIC_FRONTEND_DIR.resolve()

    if static_root not in requested_path.parents and requested_path != static_root:
        return None

    candidates = [
        requested_path,
        requested_path.with_suffix(".html"),
        requested_path / "index.html",
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


if (STATIC_FRONTEND_DIR / "_next").is_dir():
    app.mount(
        "/_next",
        StaticFiles(directory=STATIC_FRONTEND_DIR / "_next"),
        name="next_static",
    )


@app.get("/", response_model=None)
def root() -> Response | dict[str, str]:
    if packaged_frontend_available():
        return FileResponse(STATIC_FRONTEND_DIR / "index.html")

    return {
        "message": "SuperSQA Job Tracker API",
        "api_version": settings.api_version,
        "api_base": API_V1_PREFIX,
        "docs": "/docs",
    }


@app.get("/{frontend_path:path}", include_in_schema=False)
def serve_packaged_frontend(frontend_path: str) -> FileResponse:
    if not packaged_frontend_available():
        raise HTTPException(status_code=404, detail="Packaged frontend not found")

    if frontend_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not Found")

    frontend_file = resolve_frontend_file(frontend_path)
    if frontend_file is not None:
        return FileResponse(frontend_file)

    not_found_page = STATIC_FRONTEND_DIR / "404.html"
    if not_found_page.is_file():
        return FileResponse(not_found_page, status_code=404)

    raise HTTPException(status_code=404, detail="Not Found")
