from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import GeneratedQuestion, InterviewSession, User
from ..schemas import QuestionGenerateRequest, QuestionGenerateResponse, SaveQuestionRequest
from ..services.ai_service import ai_service


router = APIRouter()


@router.post("/generate", response_model=QuestionGenerateResponse)
def generate_questions(
    payload: QuestionGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    questions = ai_service.generate_questions(
        role=payload.role,
        difficulty=payload.difficulty,
        question_types=payload.question_type,
        count=payload.count,
    )

    session = InterviewSession(
        user_id=user.id,
        role=payload.role,
        difficulty=payload.difficulty,
        question_type=", ".join(payload.question_type),
        source="generator",
    )
    db.add(session)
    db.flush()

    created_questions = []
    for item in questions:
        question_record = GeneratedQuestion(
            session_id=session.id,
            question=item["question"],
            explanation=item.get("explanation"),
            expected_answer=item["expected_answer"],
            key_points=item["key_points"],
            category=item["category"],
            difficulty=item["difficulty"],
            question_type=item.get("question_type", payload.question_type[0]),
            details=item.get("details"),
        )
        db.add(question_record)
        created_questions.append(question_record)

    db.flush()
    db.commit()
    return QuestionGenerateResponse(session_id=session.id, questions=created_questions)


@router.post("/save")
def save_question(
    payload: SaveQuestionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    question = (
        db.query(GeneratedQuestion)
        .join(InterviewSession, InterviewSession.id == GeneratedQuestion.session_id)
        .filter(GeneratedQuestion.id == payload.question_id, InterviewSession.user_id == user.id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    question.saved = payload.saved
    db.commit()
    return {"success": True, "question_id": question.id, "saved": question.saved}
