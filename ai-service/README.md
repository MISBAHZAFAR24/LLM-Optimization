# Promptly AI service

FastAPI service for local, rule-based LLM usage analysis and cost recommendations. It does not call OpenAI or any external model API.

## Configure and run

Copy `.env.example` to `.env` and configure a strong `AI_SERVICE_TOKEN`. Set the same service token in `Backend/.env`; the Node API should use `AI_SERVICE_URL=http://127.0.0.1:3001`. No OpenAI key is required.

With Python 3.11 or newer, run these commands from this directory:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 3001 --reload
```

## Deploy on Render

Set the service root directory to `ai-service` and use this start command:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The health endpoint is `/health`. The protected recommendation endpoint is `POST /api/optimization/recommendations`; it accepts `{"records": [...]}` from the backend. Never put the AI service token in the frontend.

Run tests with:

```powershell
python -m unittest discover -s app/tests -v
```
