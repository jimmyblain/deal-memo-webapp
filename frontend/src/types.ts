export interface ExtractedFields {
  vendor_name: string;
  description_of_services: string;
  total_cost: string;
  payment_terms: string;
  contract_start_date: string;
  contract_end_date: string;
  contract_type: string;
  renewal_terms: string;
  termination_clause: string;
  key_deliverables: string;
  sla_terms: string;
  confidentiality_terms: string;
  liability_cap: string;
  insurance_requirements: string;
}

export interface ManualFieldValues {
  deal_owner: string;
  department: string;
  business_justification: string;
  budget_code: string;
  approver_name: string;
  deal_priority: "Low" | "Medium" | "High" | "Critical";
  internal_notes: string;
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
