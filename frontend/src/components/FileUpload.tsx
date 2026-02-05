import { useState, useCallback, type DragEvent, type ChangeEvent } from "react";
import type { UploadedFile } from "../types";
import "./FileUpload.css";

interface Props {
  onUpload: (files: UploadedFile[]) => void;
  isLoading: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_MB = 20;

export default function FileUpload({ onUpload, isLoading }: Props) {
  const [sowFile, setSowFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<"sow" | "contract" | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported file type. Please upload a PDF or .docx file.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" exceeds the ${MAX_SIZE_MB}MB size limit.`;
    }
    return null;
  }

  function handleFile(file: File, label: "sow" | "contract") {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    if (label === "sow") setSowFile(file);
    else setContractFile(file);
  }

  const handleDrop = useCallback(
    (e: DragEvent, label: "sow" | "contract") => {
      e.preventDefault();
      setDragOver(null);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file, label);
    },
    []
  );

  function handleInputChange(e: ChangeEvent<HTMLInputElement>, label: "sow" | "contract") {
    const file = e.target.files?.[0];
    if (file) handleFile(file, label);
  }

  function handleSubmit() {
    const uploadFiles: UploadedFile[] = [];
    if (sowFile) uploadFiles.push({ file: sowFile, label: "sow" });
    if (contractFile) uploadFiles.push({ file: contractFile, label: "contract" });
    if (uploadFiles.length === 0) return;
    onUpload(uploadFiles);
  }

  function renderDropZone(label: "sow" | "contract", title: string, file: File | null) {
    return (
      <div
        className={`drop-zone ${dragOver === label ? "drag-over" : ""} ${file ? "has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(label); }}
        onDragLeave={() => setDragOver(null)}
        onDrop={(e) => handleDrop(e, label)}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => handleInputChange(e, label)}
          id={`file-${label}`}
          className="file-input"
        />
        <label htmlFor={`file-${label}`} className="drop-zone-label">
          {file ? (
            <>
              <span className="file-icon">&#128196;</span>
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <span className="change-link">Click to change</span>
            </>
          ) : (
            <>
              <span className="upload-icon">&#8593;</span>
              <span className="drop-title">{title}</span>
              <span className="drop-hint">
                Drag & drop or click to browse (PDF or .docx)
              </span>
            </>
          )}
        </label>
      </div>
    );
  }

  return (
    <div className="file-upload">
      <h2>Upload Documents</h2>
      <p className="upload-description">
        Upload your Statement of Work (SOW) and contract or quote. The AI will
        extract relevant deal information from these documents.
      </p>

      {fileError && <div className="file-error">{fileError}</div>}

      <div className="drop-zones">
        {renderDropZone("sow", "Statement of Work (SOW)", sowFile)}
        {renderDropZone("contract", "Contract / Quote", contractFile)}
      </div>

      <div className="step-actions">
        <div />
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={(!sowFile && !contractFile) || isLoading}
        >
          {isLoading ? "Extracting..." : "Upload & Extract"}
        </button>
      </div>

      {isLoading && (
        <div className="extraction-loading">
          <div className="spinner" />
          <p>Analyzing documents with AI... This may take a moment.</p>
        </div>
      )}
    </div>
  );
}
