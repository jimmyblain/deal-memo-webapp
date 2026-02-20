# Deal Memo Webapp — Developer Notes

## Project Overview
Internal web app: upload SOW + contract/quote docs → AI extracts fields → user reviews → generates .docx deal memo.
Azure Static Web Apps (React+TS frontend, Python Azure Functions backend).

## Architecture
- **Frontend**: React + TypeScript + Vite (`frontend/`)
- **Backend**: Python Azure Functions v2 (`api/`)
- **Template**: `templates/deal_memo_template.docx` (generated via `python templates/create_template.py`)
- **Infra**: Bicep in `infrastructure/`, CI/CD in `.github/workflows/deploy.yml`

## Current Status (as of 2026-02-19)

### Completed
- Azure OpenAI resource created (`deal-memo-openai`) — also used for Claude via AI Foundry
- Claude Sonnet 4.6 deployed as a serverless endpoint via Azure AI Foundry
- Switched from `openai` SDK + GPT-4o → `anthropic` SDK + Claude Sonnet 4.6
- venv exists at `api/.venv` with all deps installed (Python 3.9.6)
- Local end-to-end test passed: PDF upload → Claude extraction → field review → .docx generation
- Merged to `main` and deployed to production Azure SWA
- Azure SWA app settings updated with `AZURE_AI_*` env vars

### To Resume Local Development
```bash
# Terminal 1 — API
cd api && source .venv/bin/activate && func start

# Terminal 2 — Frontend
cd frontend && npm run dev
```
Then open http://localhost:5173.

## Key Files
- `api/function_app.py` — Routes: GET /api/health, POST /api/extract, POST /api/generate
- `api/services/ai_extractor.py` — Claude Sonnet 4.6 extraction via `anthropic` SDK
- `api/services/document_reader.py` — PDF (pdfplumber) + .docx (python-docx) text extraction
- `api/services/docx_generator.py` — docxtpl template rendering
- `api/models/deal_memo.py` — Pydantic models (ExtractedFields, ManualFields, DealMemoData)
- `frontend/src/pages/DealMemo.tsx` — Main wizard UI (4 steps)
- `api/local.settings.json` — Local env vars (gitignored, contains real key)

## Environment Vars (backend)
- `AZURE_AI_ENDPOINT` — `https://deal-memo-openai.services.ai.azure.com/anthropic` (no trailing `/v1/messages` — SDK appends it)
- `AZURE_AI_API_KEY` — Key from Azure Foundry deployment
- `AZURE_AI_DEPLOYMENT` — `claude-sonnet-4-6`

These must be set in:
- **Locally**: `api/local.settings.json` (gitignored)
- **Production**: Azure SWA → Configuration → Application settings
