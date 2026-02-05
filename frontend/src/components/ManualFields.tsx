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
          <label htmlFor="approver_name">Approver Name *</label>
          <input
            id="approver_name"
            type="text"
            value={fields.approver_name}
            onChange={(e) => handleChange("approver_name", e.target.value)}
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="deal_priority">Deal Priority</label>
          <select
            id="deal_priority"
            value={fields.deal_priority}
            onChange={(e) => handleChange("deal_priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
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
          <label htmlFor="internal_notes">Internal Notes</label>
          <textarea
            id="internal_notes"
            value={fields.internal_notes}
            onChange={(e) => handleChange("internal_notes", e.target.value)}
            placeholder="Any additional notes for internal use..."
            rows={2}
          />
        </div>
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
            !fields.approver_name ||
            !fields.business_justification
          }
        >
          Continue
        </button>
      </div>
    </div>
  );
}
