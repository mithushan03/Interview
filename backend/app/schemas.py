from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionGenerateRequest(BaseModel):
    role: str
    difficulty: str
    question_type: List[str]
    count: int = Field(default=5, ge=1, le=20)


class QuestionItem(BaseModel):
    id: Optional[int] = None
    question: str
    explanation: Optional[str] = None
    expected_answer: str
    key_points: List[str]
    difficulty: str
    category: str
    question_type: str
    details: Optional[dict] = None
    saved: bool = False

    class Config:
        from_attributes = True


class QuestionGenerateResponse(BaseModel):
    session_id: int
    questions: List[QuestionItem]


class ResumeQuestionRequest(BaseModel):
    role: str
    difficulty: str = "Intermediate"
    count: int = Field(default=5, ge=1, le=20)
    resume_text: str


class JobDescriptionRequest(BaseModel):
    role: str
    difficulty: str = "Intermediate"
    count: int = Field(default=5, ge=1, le=20)
    job_description: str


class MockStartRequest(BaseModel):
    role: str
    difficulty: str
    question_type: List[str] = Field(default_factory=lambda: ["Technical"])
    count: int = Field(default=5, ge=1, le=10)


class MockEvaluateRequest(BaseModel):
    question: str
    user_answer: str
    role: str


class MockEvaluateResponse(BaseModel):
    score: int
    feedback: str
    strengths: List[str]
    weaknesses: List[str]
    missing_points: List[str]
    improved_answer: str


class SaveQuestionRequest(BaseModel):
    question_id: int
    saved: bool


class DashboardStats(BaseModel):
    total_questions_generated: int
    mock_interviews_completed: int
    average_score: float
    recent_sessions: List[dict]
    saved_questions: int


class HistoryItem(BaseModel):
    id: int
    type: str
    role: str
    created_at: datetime
    payload: dict


class ExportRequest(BaseModel):
    title: str = "Interview Questions"
    questions: List[QuestionItem]


TokenResponse.model_rebuild()
