from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from app.routes.optimization_routes import router as optimization_router

app = FastAPI(title="Promptly AI Service", version="1.0.0")
app.include_router(optimization_router, prefix="/api/optimization", tags=["Optimization"])


@app.get("/health", tags=["System"])
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "promptly-ai-service",
        "engine": "local-rules",
    }
