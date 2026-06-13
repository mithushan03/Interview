import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import auth_routes, export_routes, history_routes, mock_routes, question_routes, resume_routes


Base.metadata.create_all(bind=engine)


def _get_allowed_origins() -> list[str]:
    origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    return [origin.strip() for origin in origins if origin.strip()]

app = FastAPI(title="AI Interview Question Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(question_routes.router, prefix="/api/questions", tags=["questions"])
app.include_router(resume_routes.router, prefix="/api/resume", tags=["resume"])
app.include_router(resume_routes.job_router, prefix="/api/job-description", tags=["job-description"])
app.include_router(mock_routes.router, prefix="/api/mock", tags=["mock"])
app.include_router(history_routes.router, prefix="/api", tags=["history"])
app.include_router(export_routes.router, prefix="/api/export", tags=["export"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
