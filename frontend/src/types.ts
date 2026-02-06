export interface ExtractedFields {
  vendor_name: string;
  description_of_services: string;
  total_cost: string;
  payment_terms: string;
  contract_start_date: string;
  contract_end_date: string;
  contractor_email: string;
  contractor_phone: string;
  contractor_address: string;
}

export interface ManualFieldValues {
  deal_owner: string;
  department: string;
  business_justification: string;
  budget_code: string;
  submission_date: string;
  budget_contemplated: string;
  requires_rf_access: string;
  contract_team_info_needed: string;
  contract_team_info_details: string;
}

export type DealMemoData = ExtractedFields & ManualFieldValues;

export interface UploadedFile {
  file: File;
  label: "sow" | "contract";
}

export interface ExtractionResponse {
  fields: ExtractedFields;
  confidence: Record<string, number>;
}
