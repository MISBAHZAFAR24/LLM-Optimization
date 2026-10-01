import { useEffect, useState } from 'react'
import { addUsageRecord, formatCurrency, getDashboardData } from '../services/api.js'
import StatCard from '../components/StatCard.jsx'
import CostChart from '../components/CostChart.jsx'

export default function Dashboard({ user }) {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), provider: '', model: '', requests: '', input_tokens: '', output_tokens: '', cost: '', latency_ms: '' })
  const loadDashboard = () => getDashboardData().then(setDashboard).catch((requestError) => setError(requestError.message))
  useEffect(() => {
    loadDashboard()
    const refreshTimer = window.setInterval(loadDashboard, 5000)
    return () => window.clearInterval(refreshTimer)
  }, [])
  const refreshDashboard = async () => {
    setRefreshing(true)
    setError('')
    await loadDashboard()
    setRefreshing(false)
  }
  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const saveUsage = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await addUsageRecord(form)
      await loadDashboard()
      setShowForm(false)
    } catch (requestError) {
      setFormError(requestError.message)
    } finally {
      setSaving(false)
    }
  }
  if (error) return <div className="loading-state error-state"><strong>Could not connect to the API.</strong><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()}>Retry connection</button></div>
  if (!dashboard) return <div className="loading-state">Loading live workspace data...</div>
  const { stats, usage, modelCosts } = dashboard
  if (!stats) return <div className="loading-state">Loading workspace overview...</div>
  return <>
    <section className="page-intro"><div><p className="eyebrow">Live data · Last 30 days</p><h1>Good morning, {user?.name || 'there'}</h1><p className="intro-copy">Here is what is happening with your LLM stack today.</p></div><div className="dashboard-actions"><button className="refresh-button" onClick={refreshDashboard} disabled={refreshing}>{refreshing ? 'Updating...' : '↻ Update dashboard'}</button><button className="primary-button" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close form' : '+ Add usage'}</button></div></section>
    {showForm && <form className="panel usage-form" onSubmit={saveUsage}><div className="panel-heading"><div><p className="eyebrow">Manual data entry</p><h2>Add usage record</h2></div><span className="live-pill">Updates dashboard</span></div><div className="usage-form-grid"><label>Date<input type="date" name="date" value={form.date} onChange={updateForm} required /></label><label>Provider<input list="provider-options" name="provider" value={form.provider} onChange={updateForm} placeholder="Choose or type provider" required /></label><label>Model<input list="model-options" name="model" value={form.model} onChange={updateForm} placeholder="Choose or type model" required /></label><label>Requests<input type="number" name="requests" value={form.requests} onChange={updateForm} min="0" required /></label><label>Input tokens<input type="number" name="input_tokens" value={form.input_tokens} onChange={updateForm} min="0" required /></label><label>Output tokens<input type="number" name="output_tokens" value={form.output_tokens} onChange={updateForm} min="0" required /></label><label>Cost ($)<input type="number" name="cost" value={form.cost} onChange={updateForm} min="0" step="0.01" required /></label><label>Latency (ms)<input type="number" name="latency_ms" value={form.latency_ms} onChange={updateForm} min="0" step="0.1" required /></label></div><datalist id="provider-options"><option value="OpenAI" /><option value="Anthropic" /><option value="Google" /><option value="Mistral" /><option value="Cohere" /></datalist><datalist id="model-options"><option value="GPT-4o" /><option value="GPT-4o mini" /><option value="Claude 3.5 Sonnet" /><option value="Gemini 1.5 Pro" /><option value="Mistral Large" /></datalist>{formError && <div className="auth-error">{formError}</div>}<button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Update dashboard with this value'}</button></form>}
    <div className="stats-grid"><StatCard label="Total spend" value={stats.spend} change="Live" icon="$" tone="teal" /><StatCard label="Tokens processed" value={stats.tokens} change="Live" icon="⌁" tone="orange" /><StatCard label="API requests" value={stats.requests} change="Live" icon="↗" tone="blue" /><StatCard label="Cost savings" value={stats.savings} change="Live from optimization" icon="✦" tone="yellow" /></div>
    <div className="dashboard-grid"><CostChart records={usage.records} /><section className="panel health-panel"><div className="panel-heading"><div><p className="eyebrow">System status</p><h2>Integration health</h2></div><span className="live-pill"><i />API connected</span></div><div className="health-score"><div className="score-ring"><strong>OK</strong></div><div><strong>Backend is responding</strong><p>Average latency: {usage.average_latency_ms} ms</p></div></div><div className="provider-list">{[...new Set(modelCosts.map((model) => model.provider))].map((provider) => <div key={provider}><span className="provider-logo openai">{provider[0]}</span><span>{provider}</span><b>Operational</b><i /></div>)}</div><button className="text-button">API health check <span>→</span></button></section></div>
    <section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">Spend distribution</p><h2>Top models by cost</h2></div><button className="text-button">{modelCosts.length} connected models <span>→</span></button></div><div className="table-wrap"><table><thead><tr><th>Model</th><th>Provider</th><th>Spend</th><th>Share</th><th>Status</th></tr></thead><tbody>{modelCosts.map((model) => <tr key={model.model}><td><strong>{model.model}</strong></td><td>{model.provider}</td><td>{formatCurrency(model.spend)}</td><td><div className="share-cell"><span className="share-track"><i style={{ width: `${model.share}%` }} /></span>{model.share}%</div></td><td><span className="status"><i />Active</span></td></tr>)}</tbody></table></div></section>
  </>
}
