export async function getRecommendations(records) {
  const serviceUrl = process.env.AI_SERVICE_URL || 'https://llm-optimization-3.onrender.com'
  const serviceToken = process.env.AI_SERVICE_TOKEN
  if (!serviceUrl || !serviceToken) {
    const error = new Error('AI service is not configured. Set AI_SERVICE_URL and AI_SERVICE_TOKEN.')
    error.status = 503
    throw error
  }
  let response
  try {
    response = await fetch(`${serviceUrl.replace(/\/$/, '')}/api/optimization/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceToken}` },
      body: JSON.stringify({ records }),
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    const error = new Error('AI service is unavailable. Start the ai-service and try again.')
    error.status = 503
    throw error
  }
  const result = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(result?.detail || 'AI service could not generate recommendations.')
    error.status = response.status === 503 ? 503 : 502
    throw error
  }
  return result.recommendations
}
