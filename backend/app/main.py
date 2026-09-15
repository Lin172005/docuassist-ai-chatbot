import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database import engine
from app.routers.chat import router as chat_router
from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.categories import router as categories_router
from app.routers.fields import router as fields_router

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        (
            "http://localhost:3000,"
            "https://docuassist-ai-chatbot-nine.vercel.app"
        ),
    ).split(",")
    if origin.strip()
]


app = FastAPI(
    title="WildHive API",
    description="Backend API for the WildHive website and AI honey guide.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_cache_control_headers(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/api/products") or path.startswith("/api/categories") or path.startswith("/api/field-configs") or path.startswith("/api/custom-fields"):
        if request.method == "GET":
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
    return response


app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(fields_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "WildHive API",
    }


@app.get("/health/ready")
def readiness_check() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("select 1"))

        return {
            "status": "ready",
            "database": "connected",
        }

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable.",
        ) from error
