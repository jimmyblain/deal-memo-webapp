import json
import logging

import azure.functions as func

from models.deal_memo import DealMemoData
from services.ai_extractor import extract_fields
from services.docx_generator import generate_deal_memo
from services.document_reader import extract_text

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def _error_response(message: str, status_code: int = 400) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps({"error": message}),
        status_code=status_code,
        mimetype="application/json",
    )


@app.route(route="health", methods=["GET"])
def health(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint."""
    return func.HttpResponse(
        json.dumps({"status": "healthy"}),
        mimetype="application/json",
    )


@app.route(route="extract", methods=["POST"])
def extract(req: func.HttpRequest) -> func.HttpResponse:
    """Accept uploaded documents, extract text, and return AI-extracted fields."""
    try:
        document_texts: list[str] = []

        for label in ["sow", "contract"]:
            file = req.files.get(label)
            if not file:
                continue

            filename = file.filename or ""
            ext = ("." + filename.rsplit(".", 1)[-1]).lower() if "." in filename else ""
            if ext not in ALLOWED_EXTENSIONS:
                return _error_response(
                    f"Unsupported file type for {label}: {filename}. "
                    f"Accepted types: PDF, .docx"
                )

            file_bytes = file.read()
            if len(file_bytes) > MAX_FILE_SIZE:
                return _error_response(
                    f"File {filename} exceeds the 20MB size limit."
                )

            text = extract_text(filename, file_bytes)
            if text.strip():
                document_texts.append(f"--- {label.upper()} ({filename}) ---\n{text}")

        if not document_texts:
            return _error_response("No valid documents uploaded. Please upload at least one PDF or .docx file.")

        combined_text = "\n\n".join(document_texts)
        result = extract_fields(combined_text)

        return func.HttpResponse(
            result.model_dump_json(),
            mimetype="application/json",
        )

    except Exception as e:
        logger.exception("Error during extraction")
        return _error_response(f"Extraction failed: {str(e)}", status_code=500)


@app.route(route="generate", methods=["POST"])
def generate(req: func.HttpRequest) -> func.HttpResponse:
    """Generate a deal memo .docx from the provided field data."""
    try:
        body = req.get_json()
        data = DealMemoData(**body)
        docx_bytes = generate_deal_memo(data)

        vendor = data.vendor_name or "Document"
        filename = f"Deal_Memo_{vendor}.docx"

        return func.HttpResponse(
            docx_bytes,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )

    except FileNotFoundError as e:
        logger.exception("Template not found")
        return _error_response(str(e), status_code=500)
    except Exception as e:
        logger.exception("Error during generation")
        return _error_response(f"Generation failed: {str(e)}", status_code=500)
