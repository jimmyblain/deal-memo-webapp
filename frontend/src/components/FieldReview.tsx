import type { ExtractedFields } from "../types";
import "./FieldReview.css";

interface Props {
  fields: ExtractedFields;
  confidence: Record<string, number>;
  onChange: (fields: ExtractedFields) => void;
  onNext: () => void;
  onBack: () => void;
}

const FIELD_LABELS: Record<keyof ExtractedFields, string> = {
  vendor_name: "Vendor Name",
  description_of_services: "Description of Services",
  total_cost: "Total Cost",
  payment_terms: "Payment Terms",
  contract_start_date: "Contract Start Date",
  contract_end_date: "Contract End Date",
  contractor_email: "Contractor Email",
  contractor_phone: "Contractor Phone",
  contractor_address: "Contractor Address",
};

const LONG_FIELDS: (keyof ExtractedFields)[] = [
  "description_of_services",
  "contractor_address",
];

function confidenceLabel(value: number): { text: string; className: string } {
  if (value >= 0.8) return { text: "High", className: "confidence-high" };
  if (value >= 0.5) return { text: "Medium", className: "confidence-medium" };
  return { text: "Low", className: "confidence-low" };
}

export default function FieldReview({
  fields,
  confidence,
  onChange,
  onNext,
  onBack,
}: Props) {
  function handleChange(key: keyof ExtractedFields, value: string) {
    onChange({ ...fields, [key]: value });
  }

  return (
    <div className="field-review">
      <h2>Review Extracted Data</h2>
      <p className="review-description">
        The AI has extracted the following information from your documents.
        Please review and correct any fields as needed.
      </p>

      <div className="fields-grid">
        {(Object.keys(FIELD_LABELS) as (keyof ExtractedFields)[]).map((key) => {
          const conf = confidence[key];
          const confInfo = conf !== undefined ? confidenceLabel(conf) : null;
          const isLong = LONG_FIELDS.includes(key);

          return (
            <div
              key={key}
              className={`field-group ${isLong ? "field-full" : ""}`}
            >
              <label htmlFor={`field-${key}`}>
                {FIELD_LABELS[key]}
                {confInfo && (
                  <span className={`confidence-badge ${confInfo.className}`}>
                    {confInfo.text}
                  </span>
                )}
              </label>
              {isLong ? (
                <textarea
                  id={`field-${key}`}
                  value={fields[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={3}
                />
              ) : (
                <input
                  id={`field-${key}`}
                  type="text"
                  value={fields[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="step-actions">
        <button className="btn" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}
