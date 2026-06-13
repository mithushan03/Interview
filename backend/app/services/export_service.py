from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def build_questions_pdf(title: str, questions: list[dict]) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    story = [Paragraph(title, styles["Title"]), Spacer(1, 16)]

    for index, question in enumerate(questions, start=1):
        story.append(Paragraph(f"{index}. {question['question']}", styles["Heading3"]))
        story.append(Paragraph(f"Expected Answer: {question['expected_answer']}", styles["BodyText"]))
        story.append(Paragraph(f"Key Points: {', '.join(question['key_points'])}", styles["BodyText"]))
        story.append(Paragraph(f"Category: {question['category']} | Difficulty: {question['difficulty']}", styles["BodyText"]))
        story.append(Spacer(1, 12))

    doc.build(story)
    return buffer.getvalue()
