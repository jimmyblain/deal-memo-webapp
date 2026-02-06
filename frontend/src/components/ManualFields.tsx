import type { ManualFieldValues } from "../types";
import "./ManualFields.css";

interface Props {
  fields: ManualFieldValues;
  onChange: (fields: ManualFieldValues) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ManualFields({ fields, onChange, onNext, onBack }: Props) {
  function handleChange(key: keyof ManualFieldValues, value: string) {
    onChange({ ...fields, [key]: value } as ManualFieldValues);
  }

  return (
    <div className="manual-fields">
      <h2>Additional Details</h2>
      <p className="manual-description">
        Please provide the following information that is not typically found in
        the uploaded documents.
      </p>

      <div className="manual-grid">
        <div className="field-group">
          <label htmlFor="deal_owner">Deal Owner *</label>
          <input
            id="deal_owner"
            type="text"
            value={fields.deal_owner}
            onChange={(e) => handleChange("deal_owner", e.target.value)}
            placeholder="e.g., Jane Smith"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="department">Department *</label>
          <input
            id="department"
            type="text"
            value={fields.department}
            onChange={(e) => handleChange("department", e.target.value)}
            placeholder="e.g., Engineering"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="budget_code">Budget Code</label>
          <input
            id="budget_code"
            type="text"
            value={fields.budget_code}
            onChange={(e) => handleChange("budget_code", e.target.value)}
            placeholder="e.g., ENG-2026-001"
          />
        </div>

        <div className="field-group">
          <label htmlFor="submission_date">Submission Date</label>
          <input
            id="submission_date"
            type="text"
            value={fields.submission_date}
            onChange={(e) => handleChange("submission_date", e.target.value)}
            placeholder="MM-DD-YYYY"
          />
        </div>

        <div className="field-group field-full">
          <label htmlFor="business_justification">Business Justification *</label>
          <textarea
            id="business_justification"
            value={fields.business_justification}
            onChange={(e) => handleChange("business_justification", e.target.value)}
            placeholder="Explain the business need for this deal..."
            rows={3}
            required
          />
        </div>

        <div className="field-group field-full">
          <label>Was this project contemplated when the current year budget was finalized?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="budget_contemplated"
                value="Yes"
                checked={fields.budget_contemplated === "Yes"}
                onChange={(e) => handleChange("budget_contemplated", e.target.value)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="budget_contemplated"
                value="No"
                checked={fields.budget_contemplated === "No"}
                onChange={(e) => handleChange("budget_contemplated", e.target.value)}
              />
              No
            </label>
          </div>
        </div>

        <div className="field-group field-full">
          <label>Will the contractor require the use of RF equipment or systems access?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="requires_rf_access"
                value="Yes"
                checked={fields.requires_rf_access === "Yes"}
                onChange={(e) => handleChange("requires_rf_access", e.target.value)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="requires_rf_access"
                value="No"
                checked={fields.requires_rf_access === "No"}
                onChange={(e) => handleChange("requires_rf_access", e.target.value)}
              />
              No
            </label>
          </div>
        </div>

        <div className="field-group field-full">
          <label>Is there any information the contract team needs to know?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="contract_team_info_needed"
                value="Yes"
                checked={fields.contract_team_info_needed === "Yes"}
                onChange={(e) => handleChange("contract_team_info_needed", e.target.value)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="contract_team_info_needed"
                value="No"
                checked={fields.contract_team_info_needed === "No"}
                onChange={(e) => handleChange("contract_team_info_needed", e.target.value)}
              />
              No
            </label>
          </div>
        </div>

        {fields.contract_team_info_needed === "Yes" && (
          <div className="field-group field-full">
            <label htmlFor="contract_team_info_details">
              Please provide details for the contract team *
            </label>
            <textarea
              id="contract_team_info_details"
              value={fields.contract_team_info_details}
              onChange={(e) => handleChange("contract_team_info_details", e.target.value)}
              placeholder="Describe what the contract team needs to know..."
              rows={3}
              required
            />
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={
            !fields.deal_owner ||
            !fields.department ||
            !fields.business_justification
          }
        >
          Continue
        </button>
      </div>
    </div>
  );
}
