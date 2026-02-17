import json
import logging
import os

import anthropic

from models.deal_memo import ExtractedFields, ExtractionResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert at extracting structured deal information from business documents.
You will be given text extracted from a Statement of Work (SOW) and/or a contract/quote document.

Extract the following fields and return them as a JSON object. If a field is not found in the documents,
return an empty string for that field. Do NOT fabricate information.

Return all dates in MM-DD-YYYY format (e.g., 01-15-2026).

Required fields:
- vendor_name: The name of the vendor, contractor, or service provider
- description_of_services: A concise summary of the services being provided
- total_cost: The total cost/price of the deal (include currency)
- payment_terms: Must be one of: "Net 30", "Net 60", "When Invoiced", "Cash on Delivery". Pick the closest match from the document.
- contract_start_date: When the contract begins (MM-DD-YYYY format)
- contract_end_date: When the contract ends (MM-DD-YYYY format)
- contractor_email: The contractor's or vendor's email address
- contractor_phone: The contractor's or vendor's phone number
- contractor_address: The contractor's or vendor's business address

Also return a "confidence" object with the same keys, where each value is a number between 0 and 1
indicating how confident you are that the extracted value is correct. Use 0.0 if the field was not
found in the documents.

Return ONLY valid JSON with two keys: "fields" and "confidence". No explanation, no markdown fencing.
"""


def extract_fields(document_text: str) -> ExtractionResult:
    """Send document text to Claude via Azure AI Foundry and extract structured fields."""
    client = anthropic.Anthropic(
        base_url=os.environ["AZURE_AI_ENDPOINT"],
        api_key=os.environ["AZURE_AI_API_KEY"],
    )

    deployment = os.environ.get("AZURE_AI_DEPLOYMENT", "claude-sonnet-4-6")

    logger.info(
        "Sending %d characters to Claude (%s) for extraction",
        len(document_text),
        deployment,
    )

    response = client.messages.create(
        model=deployment,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Extract deal information from the following document text:\n\n{document_text}",
            }
        ],
        max_tokens=4096,
        temperature=0.1,
    )

    content = response.content[0].text
    if not content:
        raise ValueError("Empty response from Claude")

    parsed = json.loads(content)

    fields = ExtractedFields(**parsed.get("fields", parsed))
    confidence = parsed.get("confidence", {})

    return ExtractionResult(fields=fields, confidence=confidence)
