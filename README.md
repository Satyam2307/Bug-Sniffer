# Bug Sniffer ⌁

**Bug Sniffer** is a full-stack, developer-first static auditing tool built for hackathons and production QA pipelines. It identifies "silent" content-level bugs in public GitHub repositories—issues like zero-byte image files or malformed JSON, SVG, and XML configurations that pass standard syntax linters and compilers but silently break production user interfaces.

---

## 🚀 Key Features

*   **Two-Stage Auditing Pipeline**: Runs fast, local deterministic scans first, sending *only* confirmed issues to the LLM. Keeps latency under a minute and costs to zero.
*   **Multi-Model AI Explanations**: Seamlessly supports both **Google Gemini 2.5 Flash** (default) and **Groq Llama-3** to construct plain-English bug explanations and severity/confidence ratings.
*   **Circular Health Index Dashboard**: Visualizes repository health status in real-time, penalizing issues based on confidence levels.
*   **Interactive Demo Mode**: Zero-config mock scanning (`demo/buggy-repo`) for flawless live pitches and presentation scenarios.
*   **Search & Filter Tabs**: Sort through issues by zero-byte assets, malformed files, or confidence scores instantly.
*   **Click-to-Expand Code Snippets**: Inspect the exact lines of malformed code causing the parse errors directly inside the dashboard.

---

## 🛠 Architecture & Tech Stack

```
User Input (GitHub url) ──> [React SPA Dashboard]
                                   │
                                   ▼ POST /api/scan
                           [FastAPI Backend]
                                   │
                    ┌──────────────┴──────────────┐
                    ▼ (Deterministic Audits)      ▼ (AI Explanation Layer)
              1. Walk Tree API               4. Send content to LLM
              2. Size == 0 Assets            5. Retrieve structured JSON
              3. XML/JSON parsers            6. Populate code snippet views
                    │                             │
                    └──────────────┬──────────────┘
                                   ▼
                        Aggregate Scan Findings
```

*   **Frontend**: React (Single Page Application), Vite, and Custom Glassmorphic CSS.
*   **Backend**: FastAPI, Async HTTPX, and Python 3 XML/JSON parsing utilities.
*   **Integration**: GitHub REST API (recursive trees & blobs).
*   **LLM Providers**: Google Gemini REST API or Groq API.

---

## 📦 Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js 18+

### 1. Setup Backend
Activate the virtual environment, install dependencies, and create the `.env` configuration.

```bash
# Navigate to backend
cd backend

# Create .env file
touch .env
```

Add the following environment variables to `backend/.env`:
```env
GITHUB_TOKEN=your_github_personal_access_token # Recommended to prevent API rate limits
GEMINI_API_KEY=your_gemini_api_key             # Recommended (Gemini 2.5 Flash used by default)
GROQ_API_KEY=your_groq_api_key                 # Optional fallback
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

Start the backend server:
```bash
# From workspace root
.venv/bin/uvicorn backend.main:app --port 8000 --reload
```

---

### 2. Setup Frontend
Install Node dependencies and launch the Vite development server.

```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

The frontend will run on [http://localhost:5174/](http://localhost:5174/) (or fallback to port `5173`/`5175` depending on port availability). Open it in your browser and start sniffing!

---

## 💡 Hackathon Demo Mode
To showcase the application instantly without configuring API keys or waiting for live API calls, click the **"Run Hackathon Demo Repo"** button under the input bar, or enter:
`demo/buggy-repo`

This triggers an instant, pre-compiled audit profile showing realistic zero-byte PNG, malformed JSON, and distorted SVG findings.
