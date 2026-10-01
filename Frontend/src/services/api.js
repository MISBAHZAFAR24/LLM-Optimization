const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api'

async function request(path) {
  const response = await fetch(`${API_URL}${path}`, { headers: authHeaders() })
  return readResponse(response)
}

async function send(path, body) {
  const response = await fetch(`${API_URL}${path}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
  return readResponse(response)
}

function authHeaders() {
  const token = localStorage.getItem('promptly_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function readResponse(response) {
  const data = await response.json()
  if (response.status === 401 && localStorage.getItem('promptly_token')) {
    localStorage.removeItem('promptly_token')
    localStorage.removeItem('promptly_user')
    window.dispatchEvent(new Event('promptly:session-expired'))
  }
  if (!response.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export function register(details) { return send('/auth/register', details) }
export function login(details) { return send('/auth/login', details) }
export function getUsage(period = '30d') { return request(`/usage/summary?period=${period}`) }
export function getModelCosts() { return request('/costs/models') }
export function getOptimizationSummary() { return request('/optimization/summary') }
export function addUsageRecord(record) { return send('/usage/records', record) }
export function addOptimizationOpportunity(opportunity) { return send('/optimization/opportunities', opportunity) }
export function getAiRecommendations() { return send('/ai/recommendations', {}) }

export const formatCurrency = (value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatCompact = (value) => `${(Number(value) / 1000000).toFixed(1)}M`

export async function getDashboardData() {
  const [usage, modelCosts, optimization] = await Promise.all([
    request('/usage/summary?period=30d'),
    request('/costs/models'),
    request('/optimization/summary'),
  ])

  return {
    stats: {
      spend: formatCurrency(usage.total_cost),
      tokens: formatCompact(usage.total_tokens),
      requests: Number(usage.total_requests).toLocaleString('en-US'),
      savings: formatCurrency(optimization.estimated_monthly_savings),
    },
    usage,
    modelCosts,
    optimization,
  }
}
