from io import BytesIO

import fitz


def extract_text_from_pdf(file_bytes: bytes) -> str:
    with fitz.open(stream=BytesIO(file_bytes), filetype="pdf") as document:
        return "\n".join(page.get_text("text") for page in document)
