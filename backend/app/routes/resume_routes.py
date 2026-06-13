from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import GeneratedQuestion, InterviewSession, User
from ..schemas import JobDescriptionRequest, QuestionGenerateResponse, ResumeQuestionRequest
from ..services.ai_service import ai_service
from ..services.pdf_service import extract_text_from_pdf


router = APIRouter()
job_router = APIRouter()


def _persist_generated_questions(
    db: Session,
    user_id: int,
    role: str,
    difficulty: str,
    source: str,
    question_type: str,
    questions: list[dict],
) -> QuestionGenerateResponse:
    session = InterviewSession(
        user_id=user_id,
        role=role,
        difficulty=difficulty,
        question_type=question_type,
        source=source,
    )
    db.add(session)
    db.flush()

    records = []
    for item in questions:
        record = GeneratedQuestion(
            session_id=session.id,
            question=item["question"],
            explanation=item.get("explanation"),
            expected_answer=item["expected_answer"],
            key_points=item["key_points"],
            category=item["category"],
            difficulty=item["difficulty"],
            question_type=item.get("question_type", question_type),
            details=item.get("details"),
        )
        db.add(record)
        records.append(record)

    db.commit()
    return QuestionGenerateResponse(session_id=session.id, questions=records)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    content = await file.read()
    extracted_text = extract_text_from_pdf(content)
    return {"filename": file.filename, "text": extracted_text}


@router.post("/generate-questions", response_model=QuestionGenerateResponse)
def generate_resume_questions(
    payload: ResumeQuestionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    questions = ai_service.generate_questions(
        role=payload.role,
        difficulty=payload.difficulty,
        question_types=["Technical", "Project-based", "HR/behavioral"],
        count=payload.count,
        context_text=payload.resume_text,
        mode="resume",
    )
    return _persist_generated_questions(
        db,
        user.id,
        payload.role,
        payload.difficulty,
        "resume",
        "Resume-based",
        questions,
    )


@job_router.post("/generate-questions", response_model=QuestionGenerateResponse)
def generate_jd_questions(
    payload: JobDescriptionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    questions = ai_service.generate_questions(
        role=payload.role,
        difficulty=payload.difficulty,
        question_types=["Technical", "Scenario-based", "Project-based"],
        count=payload.count,
        context_text=payload.job_description,
        mode="job_description",
    )
    return _persist_generated_questions(
        db,
        user.id,
        payload.role,
        payload.difficulty,
        "job_description",
        "Job-description-based",
        questions,
    )


@job_router.post("/upload")
async def upload_job_description_pdf(
    role: str = Form(...),
    difficulty: str = Form("Intermediate"),
    count: int = Form(5),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    content = await file.read()
    extracted_text = extract_text_from_pdf(content)
    questions = ai_service.generate_questions(
        role=role,
        difficulty=difficulty,
        question_types=["Technical", "Scenario-based", "Project-based"],
        count=count,
        context_text=extracted_text,
        mode="job_description",
    )
    response = _persist_generated_questions(
        db,
        user.id,
        role,
        difficulty,
        "job_description",
        "Job-description-based",
        questions,
    )
    return {"text": extracted_text, "result": response}
