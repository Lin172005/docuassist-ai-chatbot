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


import time
from collections import defaultdict

# Simple in-memory sliding window rate limiter
_request_records: dict[str, list[float]] = defaultdict(list)

# Rate limits: path_prefix -> (max_requests, window_seconds)
RATE_LIMIT_RULES: list[tuple[str, int, int]] = [
    ("/api/chat", 20, 60),       # 20 requests/minute for chat
    ("/api/auth/login", 15, 60), # 15 requests/minute for login
]


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    path = request.url.path
    now = time.time()

    for prefix, max_reqs, window in RATE_LIMIT_RULES:
        if path.startswith(prefix):
            key = f"{client_ip}:{prefix}"
            timestamps = _request_records[key]
            # Prune old timestamps
            _request_records[key] = [t for t in timestamps if now - t < window]
            if len(_request_records[key]) >= max_reqs:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded. Please try again shortly."},
                    headers={"Retry-After": str(window)},
                )
            _request_records[key].append(now)
            break

    return await call_next(request)


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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred."},
    )



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
