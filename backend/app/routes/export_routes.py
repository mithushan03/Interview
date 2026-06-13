from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from ..auth import get_current_user
from ..models import User
from ..schemas import ExportRequest
from ..services.export_service import build_questions_pdf


router = APIRouter()


@router.post("/pdf")
def export_questions_pdf(
    payload: ExportRequest,
    user: User = Depends(get_current_user),
):
    pdf_bytes = build_questions_pdf(payload.title, [question.model_dump() for question in payload.questions])
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="interview-questions.pdf"'},
    )
