from pydantic import BaseModel, Field


class ExtractedFields(BaseModel):
    vendor_name: str = ""
    description_of_services: str = ""
    total_cost: str = ""
    payment_terms: str = ""
    contract_start_date: str = ""
    contract_end_date: str = ""
    contractor_email: str = ""
    contractor_phone: str = ""
    contractor_address: str = ""


class ExtractionResult(BaseModel):
    fields: ExtractedFields
    confidence: dict[str, float] = Field(default_factory=dict)


class ManualFields(BaseModel):
    deal_owner: str = ""
    department: str = ""
    business_justification: str = ""
    budget_code: str = ""
    submission_date: str = ""
    budget_contemplated: str = ""
    requires_rf_access: str = ""
    contract_team_info_needed: str = ""
    contract_team_info_details: str = ""


class DealMemoData(ExtractedFields, ManualFields):
    """Combined model with all fields needed for document generation."""

    pass
