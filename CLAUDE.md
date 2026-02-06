# Deal Memo Webapp — Developer Notes

## Project Overview
Internal web app: upload SOW + contract/quote docs → AI extracts fields → user reviews → generates .docx deal memo.
Azure Static Web Apps (React+TS frontend, Python Azure Functions backend).

## Architecture
- **Frontend**: React + TypeScript + Vite (`frontend/`)
- **Backend**: Python Azure Functions v2 (`api/`)
- **Template**: `templates/deal_memo_template.docx` (generated via `python templates/create_template.py`)
- **Infra**: Bicep in `infrastructure/`, CI/CD in `.github/workflows/deploy.yml`

## Current Status (as of 2026-02-05)

### Completed
- Azure OpenAI resource created in Azure Portal (`deal-memo-openai`)
- GPT-4o model deployed via Azure AI Foundry
- `api/local.settings.json` updated with real endpoint and API key
- Endpoint URL fixed: was full chat completions URL, corrected to base URL only (`https://deal-memo-openai.cognitiveservices.azure.com/`)
- No code changes needed for Foundry — the `openai` SDK's `AzureOpenAI` client works identically

### Blocking Issue: Python version mismatch on `func start`
- The **old** `func start` process used **Python 3.9.6** (`/usr/bin/python3`) which had deps installed
- After killing and restarting, `func start` picked up **Python 3.13.12** (`/opt/homebrew/.../python3.13`) which does NOT have pydantic or other deps
- **No virtual environment exists** in the project — deps were installed globally for 3.9 only
- **Fix needed**: Create a venv or install deps for the Python version `func` picks up

### To Resume
1. Fix the Python version issue (recommended: create a venv in `api/`):
   ```bash
   cd api
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   func start
   ```
   If `func start` still picks up 3.13, try: `python3.13 -m pip install -r requirements.txt`
2. Verify health: `curl http://localhost:7071/api/health` → `{"status": "healthy"}`
3. Test full flow: upload a document at http://localhost:5173

### Security Note
The API key is visible in `api/local.settings.json`. Consider rotating it in Azure Portal (Keys and Endpoint → Regenerate Key 1) if it was exposed.

## Key Files
- `api/function_app.py` — Routes: GET /api/health, POST /api/extract, POST /api/generate
- `api/services/ai_extractor.py` — Azure OpenAI GPT-4o field extraction (uses `AzureOpenAI` client)
- `api/services/document_reader.py` — PDF (pdfplumber) + .docx (python-docx) text extraction
- `api/services/docx_generator.py` — docxtpl template rendering
- `api/models/deal_memo.py` — Pydantic models (ExtractedFields, ManualFields, DealMemoData)
- `frontend/src/pages/DealMemo.tsx` — Main wizard UI (4 steps)
- `api/local.settings.json` — Local env vars (endpoint, key, deployment name)

## Environment Vars (backend)
- `AZURE_OPENAI_ENDPOINT` — Base URL only (e.g., `https://deal-memo-openai.cognitiveservices.azure.com/`)
- `AZURE_OPENAI_API_KEY` — Key from Azure Portal > Keys and Endpoint
- `AZURE_OPENAI_DEPLOYMENT` — Model deployment name (currently `gpt-4o`)
