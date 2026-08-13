import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.database import engine, Base, SessionLocal
from app.routers import health_router, meetings_router
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.websocket import router as ws_router
from app.seed import seed_database

load_dotenv()

frontend_url_env = os.getenv("FRONTEND_URL", "")
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://zoom-clone-six-rouge.vercel.app",
]

for env_val in [frontend_url_env, allowed_origins_env]:
    if env_val:
        for item in env_val.split(","):
            cleaned = item.strip().rstrip("/")
            if cleaned and cleaned not in origins:
                origins.append(cleaned)

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="MeetFlow Video Conferencing API",
    description="Backend REST API for MeetFlow video conferencing platform with JWT authentication.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(meetings_router)
app.include_router(admin_router)
app.include_router(ws_router)



@app.get("/")
def root():
    return {
        "name": "MeetFlow API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }
