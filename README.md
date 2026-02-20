# Deal Memo Webapp

An internal web app that turns your SOW (Statement of Work) and contract documents into a formatted deal memo — automatically. Upload your files, let AI extract the key details, review and fill in anything extra, then download a polished Word document.

## How It Works

The app walks you through a 4-step wizard:

1. **Upload Documents** — Drag-and-drop your SOW, contract, or quote files (PDF or Word, up to 20 MB each).
2. **Review Extracted Data** — AI reads your documents and pulls out key fields (vendor name, deal value, dates, etc.). You review what it found and fix anything it got wrong.
3. **Additional Details** — Fill in internal fields the AI can't know: deal owner, department, budget code, business justification, etc.
4. **Generate** — Hit the button and download a `.docx` deal memo, ready to circulate.

## Tech Stack

| Layer | Technology | What it does |
|-------|-----------|--------------|
| **Frontend** | React + TypeScript + Vite | The user interface — the wizard you interact with in the browser |
| **Backend** | Python Azure Functions | The server-side logic — reads documents, calls AI, generates the Word file |
| **AI** | Claude Sonnet 4.6 via Azure AI Foundry | The "brain" that reads your documents and extracts structured data from them |
| **Deployment** | Azure Static Web Apps | Hosts both the frontend and backend in one Azure resource, with CI/CD via GitHub Actions |

## Project Structure

```
deal-memo-webapp/
├── api/                          # Backend (Python Azure Functions)
│   ├── function_app.py           # API routes: /health, /extract, /generate
│   ├── models/
│   │   └── deal_memo.py          # Data models (what a deal memo looks like in code)
│   ├── services/
│   │   ├── ai_extractor.py       # Sends document text to Claude, gets structured fields back
│   │   ├── document_reader.py    # Reads text from PDF and Word files
│   │   └── docx_generator.py     # Fills in the Word template to produce the final memo
│   ├── templates/
│   │   └── deal_memo_template.docx  # The Word template the final memo is based on
│   └── requirements.txt          # Python dependencies
├── frontend/                     # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   └── DealMemo.tsx      # Main wizard page (orchestrates all 4 steps)
│   │   ├── components/
│   │   │   ├── FileUpload.tsx    # Step 1: file upload UI
│   │   │   ├── FieldReview.tsx   # Step 2: review AI-extracted fields
│   │   │   ├── ManualFields.tsx  # Step 3: additional manual input fields
│   │   │   └── GenerateButton.tsx # Step 4: generate and download
│   │   └── types.ts              # Shared TypeScript type definitions
│   └── package.json              # Node.js dependencies
├── infrastructure/               # Azure infrastructure-as-code (Bicep)
├── templates/                    # Word template source + generator script
│   └── create_template.py        # Run this to regenerate the .docx template
└── CLAUDE.md                     # Developer notes and current project status
```

## Prerequisites

Before you start, make sure you have these installed:

- **Node.js** (v18 or later) — runs the frontend dev server. [Download here](https://nodejs.org/).
- **Python 3.9+** — runs the backend. Check with `python3 --version`.
- **Azure Functions Core Tools** (v4) — lets you run the backend locally. [Install guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local).
- **An Azure AI Foundry deployment** — you need a Claude Sonnet 4.6 model deployed via Azure AI Foundry, with an endpoint URL and API key. See `CLAUDE.md` for details on the current setup.

## Local Development Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd deal-memo-webapp
```

### 2. Start the frontend

```bash
cd frontend
npm install        # Install JavaScript dependencies (only needed the first time)
npm run dev        # Start the dev server
```

This starts the frontend at **http://localhost:5173**. Leave this terminal running.

### 3. Start the backend

Open a **new terminal** and run:

```bash
cd api
python3 -m venv .venv          # Create a virtual environment (isolated Python setup)
source .venv/bin/activate      # Activate it (your prompt will show ".venv")
pip install -r requirements.txt # Install Python dependencies
```

Next, create your local settings file and fill in your real credentials:

```bash
cp local.settings.example.json local.settings.json   # Copy the example file
# Now open local.settings.json and replace the placeholder values with your real credentials
```

See the Environment Variables section below for what each value means. Then start the backend:

```bash
func start                     # Start the Azure Functions backend
```

The backend runs at **http://localhost:7071**. You can verify it's working:

```bash
curl http://localhost:7071/api/health
# Should return: {"status": "healthy"}
```

### 4. Use the app

Open **http://localhost:5173** in your browser and follow the wizard.

## Environment Variables

The backend needs these variables, configured in `api/local.settings.json`:

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_AI_ENDPOINT` | Anthropic-compatible endpoint from Azure AI Foundry | `https://your-resource.services.ai.azure.com/anthropic` |
| `AZURE_AI_API_KEY` | API key from your Azure AI Foundry deployment | `abc123...` |
| `AZURE_AI_DEPLOYMENT` | The Claude model deployment name | `claude-sonnet-4-6` |

Your `api/local.settings.json` should look like this:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AZURE_AI_ENDPOINT": "https://your-resource.services.ai.azure.com/anthropic",
    "AZURE_AI_API_KEY": "your-key-here",
    "AZURE_AI_DEPLOYMENT": "claude-sonnet-4-6"
  }
}
```

> **Security note:** Never commit `local.settings.json` to git — it contains your API key.

## Deployment

This app is set up to deploy to **Azure Static Web Apps**, which hosts the React frontend and the Python backend together as one resource.

Deployment happens automatically via **GitHub Actions** whenever you push to the `main` branch. The workflow file is in `.github/workflows/`. Azure Static Web Apps handles building the frontend and packaging the backend for you.

The infrastructure (the Azure resources themselves) is defined in `infrastructure/main.bicep` and can be deployed using the Azure CLI.

## Key Files Reference

| File | What it does |
|------|-------------|
| `api/function_app.py` | Defines the 3 API endpoints: health check, field extraction, and memo generation |
| `api/services/ai_extractor.py` | Sends document text to Claude Sonnet 4.6 via Azure AI Foundry and parses the structured response |
| `api/services/document_reader.py` | Extracts raw text from uploaded PDF and Word files |
| `api/services/docx_generator.py` | Takes all the fields and fills them into the Word template to produce the final memo |
| `api/models/deal_memo.py` | Pydantic models that define what fields a deal memo contains and validate the data |
| `frontend/src/pages/DealMemo.tsx` | The main wizard component that ties all 4 steps together |
| `templates/create_template.py` | Script to regenerate the Word template if you need to change the memo format |
