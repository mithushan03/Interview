from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import GeneratedQuestion, InterviewSession, MockAnswer, User
from ..schemas import QuestionItem


router = APIRouter()


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )
    answers = (
        db.query(MockAnswer)
        .filter(MockAnswer.user_id == user.id)
        .order_by(MockAnswer.created_at.desc())
        .all()
    )

    history = [
        {
            "id": session.id,
            "type": "question_session",
            "role": session.role,
            "created_at": session.created_at,
            "payload": {
                "difficulty": session.difficulty,
                "question_type": session.question_type,
                "source": session.source,
                "questions": [
                    {
                        "id": question.id,
                        "question": question.question,
                        "explanation": question.explanation,
                        "expected_answer": question.expected_answer,
                        "key_points": question.key_points,
                        "category": question.category,
                        "difficulty": question.difficulty,
                        "question_type": question.question_type,
                        "details": question.details,
                        "saved": question.saved,
                    }
                    for question in session.generated_questions
                ],
            },
        }
        for session in sessions
    ]
    history.extend(
        {
            "id": answer.id,
            "type": "mock_answer",
            "role": answer.role,
            "created_at": answer.created_at,
            "payload": {
                "question": answer.question,
                "user_answer": answer.user_answer,
                "score": answer.score,
                "feedback": answer.feedback,
                "strengths": answer.strengths,
                "weaknesses": answer.weaknesses,
                "missing_points": answer.missing_points,
                "improved_answer": answer.improved_answer,
            },
        }
        for answer in answers
    )
    history.sort(key=lambda item: item["created_at"], reverse=True)
    return history


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    total_questions = (
        db.query(func.count(GeneratedQuestion.id))
        .join(InterviewSession, InterviewSession.id == GeneratedQuestion.session_id)
        .filter(InterviewSession.user_id == user.id)
        .scalar()
        or 0
    )
    mock_count = db.query(func.count(MockAnswer.id)).filter(MockAnswer.user_id == user.id).scalar() or 0
    average_score = db.query(func.avg(MockAnswer.score)).filter(MockAnswer.user_id == user.id).scalar() or 0
    saved_questions = (
        db.query(func.count(GeneratedQuestion.id))
        .join(InterviewSession, InterviewSession.id == GeneratedQuestion.session_id)
        .filter(InterviewSession.user_id == user.id, GeneratedQuestion.saved.is_(True))
        .scalar()
        or 0
    )
    recent_sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user.id)
        .order_by(InterviewSession.created_at.desc())
        .limit(5)
        .all()
    )
    return {
        "total_questions_generated": total_questions,
        "mock_interviews_completed": mock_count,
        "average_score": round(float(average_score), 2),
        "saved_questions": saved_questions,
        "recent_sessions": [
            {
                "id": session.id,
                "role": session.role,
                "difficulty": session.difficulty,
                "question_type": session.question_type,
                "source": session.source,
                "created_at": session.created_at,
                "question_count": len(session.generated_questions),
            }
            for session in recent_sessions
        ],
    }


@router.get("/saved-questions", response_model=list[QuestionItem])
def get_saved_questions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    questions = (
        db.query(GeneratedQuestion)
        .join(InterviewSession, InterviewSession.id == GeneratedQuestion.session_id)
        .filter(InterviewSession.user_id == user.id, GeneratedQuestion.saved.is_(True))
        .order_by(GeneratedQuestion.created_at.desc())
        .all()
    )
    return questions


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id, InterviewSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
    return {"success": True, "session_id": session_id}


@router.delete("/mock-answers/{answer_id}")
def delete_mock_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    answer = (
        db.query(MockAnswer)
        .filter(MockAnswer.id == answer_id, MockAnswer.user_id == user.id)
        .first()
    )
    if not answer:
        raise HTTPException(status_code=404, detail="Mock answer not found")

    db.delete(answer)
    db.commit()
    return {"success": True, "answer_id": answer_id}
