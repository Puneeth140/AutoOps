import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from api.routes import router as jobs_router
from api.resume import router as resume_router
from api.profiles import router as profile_router
from database.mongodb import MongoDB

app = FastAPI(
    title="JobHunter API",
    description="Automated job discovery, resume profiling, and explainable job matching platform.",
    version="1.0.0",
)

allowed_origins = [origin.strip() for origin in os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(resume_router)
app.include_router(profile_router)


@app.get("/", tags=["System"])
def root():
    return {"name": "JobHunter API", "version": "1.0.0", "status": "running"}


@app.get("/health", tags=["System"])
def health():
    try:
        MongoDB().health_check()
        return {"status": "healthy", "service": "jobhunter", "database": "connected"}
    except Exception:
        return {"status": "degraded", "service": "jobhunter", "database": "unavailable"}
