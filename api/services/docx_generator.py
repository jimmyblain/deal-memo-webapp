import io
import logging
import os

from docxtpl import DocxTemplate

from models.deal_memo import DealMemoData

logger = logging.getLogger(__name__)

# Path to the template bundled with the API
TEMPLATE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "templates",
    "deal_memo_template.docx",
)


def generate_deal_memo(data: DealMemoData) -> bytes:
    """Populate the deal memo .docx template with the provided data."""
    template_path = os.environ.get("DEAL_MEMO_TEMPLATE_PATH", TEMPLATE_PATH)

    if not os.path.exists(template_path):
        raise FileNotFoundError(
            f"Deal memo template not found at: {template_path}"
        )

    logger.info("Loading template from: %s", template_path)
    doc = DocxTemplate(template_path)

    context = data.model_dump()
    logger.info("Rendering template with %d fields", len(context))
    doc.render(context)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer.read()
