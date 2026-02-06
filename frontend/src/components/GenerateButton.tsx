import { useState } from "react";
import type { ExtractedFields, ManualFieldValues, UploadedFile } from "../types";
import "./GenerateButton.css";

interface Props {
  extractedFields: ExtractedFields;
  manualFields: ManualFieldValues;
  uploadedFiles: UploadedFile[];
  onBack: () => void;
}

const EXTRACTED_LABELS: Record<keyof ExtractedFields, string> = {
  vendor_name: "Vendor Name",
  description_of_services: "Description of Services",
  total_cost: "Total Cost",
  payment_terms: "Payment Terms",
  contract_start_date: "Start Date",
  contract_end_date: "End Date",
  contractor_email: "Contractor Email",
  contractor_phone: "Contractor Phone",
  contractor_address: "Contractor Address",
};

const MANUAL_LABELS: Record<keyof ManualFieldValues, string> = {
  deal_owner: "Deal Owner",
  department: "Department",
  business_justification: "Business Justification",
  budget_code: "Budget Code",
  submission_date: "Submission Date",
  budget_contemplated: "Budget Contemplated",
  requires_rf_access: "Requires RF/Systems Access",
  contract_team_info_needed: "Contract Team Info Needed",
  contract_team_info_details: "Contract Team Info Details",
};

export default function GenerateButton({
  extractedFields,
  manualFields,
  uploadedFiles,
  onBack,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...extractedFields,
          ...manualFields,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Generation failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Deal_Memo_${extractedFields.vendor_name || "Document"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="generate-step">
      <h2>Review & Generate</h2>
      <p className="generate-description">
        Review the summary below, then click Generate to create your deal memo.
      </p>

      <div className="summary-section">
        <h3>Uploaded Documents</h3>
        <ul className="doc-list">
          {uploadedFiles.map((uf) => (
            <li key={uf.label}>
              <strong>{uf.label === "sow" ? "SOW" : "Contract/Quote"}:</strong>{" "}
              {uf.file.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="summary-section">
        <h3>Extracted Fields</h3>
        <dl className="summary-grid">
          {(Object.keys(EXTRACTED_LABELS) as (keyof ExtractedFields)[]).map(
            (key) =>
              extractedFields[key] && (
                <div key={key} className="summary-item">
                  <dt>{EXTRACTED_LABELS[key]}</dt>
                  <dd>{extractedFields[key]}</dd>
                </div>
              )
          )}
        </dl>
      </div>

      <div className="summary-section">
        <h3>Additional Details</h3>
        <dl className="summary-grid">
          {(Object.keys(MANUAL_LABELS) as (keyof ManualFieldValues)[]).map(
            (key) =>
              manualFields[key] && (
                <div key={key} className="summary-item">
                  <dt>{MANUAL_LABELS[key]}</dt>
                  <dd>{manualFields[key]}</dd>
                </div>
              )
          )}
        </dl>
      </div>

      {error && <div className="generate-error">{error}</div>}

      <div className="step-actions">
        <button className="btn" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary btn-generate"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Deal Memo"}
        </button>
      </div>

      {isGenerating && (
        <div className="extraction-loading">
          <div className="spinner" />
          <p>Generating your deal memo document...</p>
        </div>
      )}
    </div>
  );
}
