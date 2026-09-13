from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.chat import router as chat_router
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from sqlalchemy import text

from app.database import engine
from app.routers.chat import router as chat_router


load_dotenv()

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000","https://docuassist-ai-chatbot-nine.vercel.app",
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
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(chat_router)


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