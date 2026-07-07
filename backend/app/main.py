from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.errors import setup_exception_handlers
from app.routers import admin, api_keys, applications, auth, health, public, users
from app.seed import seed_demo_applications, seed_demo_users

API_V1_PREFIX = "/api/v1"


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


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "SuperSQA Job Tracker API",
        "api_version": settings.api_version,
        "api_base": API_V1_PREFIX,
        "docs": "/docs",
    }
