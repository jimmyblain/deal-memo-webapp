# Deal Memo Webapp — Developer Notes

## Project Overview
Internal web app: upload SOW + contract/quote docs → AI extracts fields → user reviews → generates .docx deal memo.
Azure Static Web Apps (React+TS frontend, Python Azure Functions backend).

## Architecture
- **Frontend**: React + TypeScript + Vite (`frontend/`)
- **Backend**: Python Azure Functions v2 (`api/`)
- **Template**: `templates/deal_memo_template.docx` (generated via `python templates/create_template.py`)
- **Infra**: Bicep in `infrastructure/`, CI/CD in `.github/workflows/deploy.yml`

## Current Status (as of 2026-02-17)

### Completed
- Azure OpenAI resource created (`deal-memo-openai`) — now also used for Claude via AI Foundry
- Claude Sonnet 4.6 deployed as a serverless endpoint via Azure AI Foundry (same resource)
- Switched codebase from `openai` SDK + GPT-4o → `anthropic` SDK + Claude Sonnet 4.6
- venv exists at `api/.venv` with all deps installed (Python 3.9.6)
- Local end-to-end test passed: PDF upload → Claude extraction → field review → .docx generation

### Active Branch: `feature/claude-sonnet-foundry`
All Claude-related changes are on this branch. **Not yet merged to `main`.**

3 commits on branch:
1. Switch SDK from `openai`/AzureOpenAI to `anthropic`/ChatCompletionsClient — rename env vars to `AZURE_AI_*`
2. Fix SDK choice: use `anthropic` package (not `azure-ai-inference`) since the endpoint uses native Anthropic Messages API
3. Strip markdown code fences from Claude response before JSON parsing

### To Resume Tomorrow
1. Start servers:
   ```bash
   # Terminal 1 — API
   cd api && source .venv/bin/activate && func start

   # Terminal 2 — Frontend
   cd frontend && npm run dev
   ```
2. Open http://localhost:5173 and do a final smoke test with a real SOW document
3. If satisfied, merge to `main` (see steps below)

### To Deploy to Production (after final testing)
1. **Update Azure SWA app settings** in the Azure Portal:
   - Go to Static Web App → **Configuration** → Application settings
   - **Delete** the three old `AZURE_OPENAI_*` settings
   - **Add** three new settings:
     | Name | Value |
     |---|---|
     | `AZURE_AI_ENDPOINT` | `https://deal-memo-openai.services.ai.azure.com/anthropic` |
     | `AZURE_AI_API_KEY` | *(your Claude deployment key from Azure Foundry)* |
     | `AZURE_AI_DEPLOYMENT` | `claude-sonnet-4-6` |
   - Click **Save**

2. **Merge the branch**:
   ```bash
   git checkout main
   git merge feature/claude-sonnet-foundry
   git push
   ```
   The GitHub Actions CI/CD pipeline will deploy automatically.

3. **Verify production**: hit the live SWA URL and upload a test document

## Key Files
- `api/function_app.py` — Routes: GET /api/health, POST /api/extract, POST /api/generate
- `api/services/ai_extractor.py` — Claude Sonnet 4.6 extraction via `anthropic` SDK
- `api/services/document_reader.py` — PDF (pdfplumber) + .docx (python-docx) text extraction
- `api/services/docx_generator.py` — docxtpl template rendering
- `api/models/deal_memo.py` — Pydantic models (ExtractedFields, ManualFields, DealMemoData)
- `frontend/src/pages/DealMemo.tsx` — Main wizard UI (4 steps)
- `api/local.settings.json` — Local env vars (gitignored, contains real key)

## Environment Vars (backend)
- `AZURE_AI_ENDPOINT` — `https://deal-memo-openai.services.ai.azure.com/anthropic` (note: no trailing `/v1/messages` — SDK appends it)
- `AZURE_AI_API_KEY` — Key from Azure Foundry deployment
- `AZURE_AI_DEPLOYMENT` — `claude-sonnet-4-6`
