import { useState } from "react";
import FileUpload from "../components/FileUpload";
import FieldReview from "../components/FieldReview";
import ManualFields from "../components/ManualFields";
import GenerateButton from "../components/GenerateButton";
import type {
  UploadedFile,
  ExtractedFields,
  ManualFieldValues,
} from "../types";
import "./DealMemo.css";

const STEPS = [
  "Upload Documents",
  "Review Extracted Data",
  "Additional Details",
  "Generate",
];

function todayMMDDYYYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${d.getFullYear()}`;
}

const INITIAL_MANUAL_FIELDS: ManualFieldValues = {
  deal_owner: "",
  department: "",
  business_justification: "",
  budget_code: "",
  submission_date: todayMMDDYYYY(),
  budget_contemplated: "",
  requires_rf_access: "",
  contract_team_info_needed: "",
  contract_team_info_details: "",
};

interface Props {
  onResetRef?: (reset: () => void) => void;
}

export default function DealMemo({ onResetRef }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [extractedFields, setExtractedFields] =
    useState<ExtractedFields | null>(null);
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [manualFields, setManualFields] =
    useState<ManualFieldValues>(INITIAL_MANUAL_FIELDS);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setCurrentStep(0);
    setFiles([]);
    setExtractedFields(null);
    setConfidence({});
    setManualFields({ ...INITIAL_MANUAL_FIELDS, submission_date: todayMMDDYYYY() });
    setError(null);
  }

  onResetRef?.(reset);

  async function handleUploadAndExtract(uploadedFiles: UploadedFile[]) {
    setFiles(uploadedFiles);
    setIsExtracting(true);
    setError(null);

    const formData = new FormData();
    for (const uf of uploadedFiles) {
      formData.append(uf.label, uf.file);
    }

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Extraction failed (${res.status})`);
      }

      const data = await res.json();
      setExtractedFields(data.fields);
      setConfidence(data.confidence || {});
      setCurrentStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  }

  function handleFieldsUpdate(fields: ExtractedFields) {
    setExtractedFields(fields);
  }

  function handleManualFieldsUpdate(fields: ManualFieldValues) {
    setManualFields(fields);
  }

  function goToStep(step: number) {
    setCurrentStep(step);
  }

  return (
    <div className="deal-memo">
      <div className="stepper">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`step ${i === currentStep ? "active" : ""} ${i < currentStep ? "completed" : ""}`}
          >
            <div className="step-number">{i < currentStep ? "\u2713" : i + 1}</div>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="step-content">
        {currentStep === 0 && (
          <FileUpload
            onUpload={handleUploadAndExtract}
            isLoading={isExtracting}
          />
        )}

        {currentStep === 1 && extractedFields && (
          <FieldReview
            fields={extractedFields}
            confidence={confidence}
            onChange={handleFieldsUpdate}
            onNext={() => goToStep(2)}
            onBack={() => goToStep(0)}
          />
        )}

        {currentStep === 2 && (
          <ManualFields
            fields={manualFields}
            onChange={handleManualFieldsUpdate}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        )}

        {currentStep === 3 && extractedFields && (
          <GenerateButton
            extractedFields={extractedFields}
            manualFields={manualFields}
            uploadedFiles={files}
            onBack={() => goToStep(2)}
          />
        )}
      </div>
    </div>
  );
}
