from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import MockAnswer, User
from ..schemas import MockEvaluateRequest, MockEvaluateResponse, MockStartRequest
from ..services.ai_service import ai_service


router = APIRouter()


@router.post("/start")
def start_mock_interview(
    payload: MockStartRequest,
    user: User = Depends(get_current_user),
):
    questions = ai_service.generate_questions(
        role=payload.role,
        difficulty=payload.difficulty,
        question_types=payload.question_type,
        count=payload.count,
    )
    return {"role": payload.role, "difficulty": payload.difficulty, "questions": questions}


@router.post("/evaluate", response_model=MockEvaluateResponse)
def evaluate_mock_answer(
    payload: MockEvaluateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    evaluation = ai_service.evaluate_mock_answer(payload.question, payload.user_answer, payload.role)
    answer = MockAnswer(
        user_id=user.id,
        question=payload.question,
        user_answer=payload.user_answer,
        score=evaluation["score"],
        feedback=evaluation["feedback"],
        strengths=evaluation["strengths"],
        weaknesses=evaluation["weaknesses"],
        missing_points=evaluation["missing_points"],
        improved_answer=evaluation["improved_answer"],
        role=payload.role,
    )
    db.add(answer)
    db.commit()
    return evaluation
