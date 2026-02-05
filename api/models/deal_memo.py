from pydantic import BaseModel, Field


class ExtractedFields(BaseModel):
    vendor_name: str = ""
    description_of_services: str = ""
    total_cost: str = ""
    payment_terms: str = ""
    contract_start_date: str = ""
    contract_end_date: str = ""
    contract_type: str = ""
    renewal_terms: str = ""
    termination_clause: str = ""
    key_deliverables: str = ""
    sla_terms: str = ""
    confidentiality_terms: str = ""
    liability_cap: str = ""
    insurance_requirements: str = ""


class ExtractionResult(BaseModel):
    fields: ExtractedFields
    confidence: dict[str, float] = Field(default_factory=dict)


class ManualFields(BaseModel):
    deal_owner: str = ""
    department: str = ""
    business_justification: str = ""
    budget_code: str = ""
    approver_name: str = ""
    deal_priority: str = "Medium"
    internal_notes: str = ""


class DealMemoData(ExtractedFields, ManualFields):
    """Combined model with all fields needed for document generation."""

    pass
