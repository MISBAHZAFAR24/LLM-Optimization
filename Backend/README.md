# Promptly backend

MongoDB-backed Express API. Copy `.env.example` to `.env` and configure MongoDB, JWT, and the AI service connection. Start the FastAPI service in a separate terminal first (see `../ai-service/README.md`), then start the API:

```powershell
npm install
npm run dev
```

The API listens on port 3000. MongoDB connects to the `llm_cost_optimization` database before the server starts. Usage, pricing, optimization, and AI cache data map to `llm_usage`, `model_pricing`, `optimization_logs`, and `cached_responses`. The separate local-rule-based Python FastAPI service is in `../ai-service`; set the same random `AI_SERVICE_TOKEN` in both local environment files and configure its URL here. No OpenAI key is required. The frontend continues to use `/api/costs/models`; pricing rates are managed through `/api/pricing/rates`.

Authenticated endpoints use `Authorization: Bearer <token>`. AI recommendation results are derived from that user's usage records and are not stored as opportunities until manually added. When a usage record omits `cost`, the API calculates it from the matching configured model price.

Run the API smoke tests with `npm test`.
