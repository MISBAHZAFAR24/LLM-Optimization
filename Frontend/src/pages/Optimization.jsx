import { useEffect, useState } from 'react'
import { addOptimizationOpportunity, formatCurrency, getAiRecommendations, getOptimizationSummary } from '../services/api.js'

export default function Optimization() {
	const [data, setData] = useState(null)
	const [error, setError] = useState('')
	const [showForm, setShowForm] = useState(false)
	const [saving, setSaving] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [analyzing, setAnalyzing] = useState(false)
	const [aiRecommendations, setAiRecommendations] = useState(null)
	const [aiError, setAiError] = useState('')
	const [formError, setFormError] = useState('')
	const [form, setForm] = useState({ title: '', category: '', description: '', estimated_monthly_savings: '', impact: 'medium' })
	const loadData = () => getOptimizationSummary().then(setData).catch((requestError) => setError(requestError.message))
	useEffect(() => { loadData(); const timer = window.setInterval(loadData, 5000); return () => window.clearInterval(timer) }, [])
	const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value })
	const refresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false) }
	const analyzeWithAi = async () => {
		setAnalyzing(true)
		setAiError('')
		try {
			const result = await getAiRecommendations()
			setAiRecommendations(result.recommendations)
		} catch (requestError) {
			setAiError(requestError.message)
		} finally {
			setAnalyzing(false)
		}
	}
	const saveOpportunity = async (event) => { event.preventDefault(); setSaving(true); setFormError(''); try { await addOptimizationOpportunity(form); await loadData(); setForm({ title: '', category: '', description: '', estimated_monthly_savings: '', impact: 'medium' }); setShowForm(false) } catch (requestError) { setFormError(requestError.message) } finally { setSaving(false) } }
	if (error) return <div className="loading-state error-state">Could not load optimization data: {error}</div>
	if (!data) return <div className="loading-state">Loading optimization opportunities...</div>
	return <><section className="page-intro"><div><p className="eyebrow">Optimization center · Live analysis</p><h1>Make every token work harder.</h1><p className="intro-copy">Prioritized opportunities calculated from your current LLM usage.</p></div><div className="dashboard-actions"><button className="refresh-button" onClick={refresh} disabled={refreshing}>{refreshing ? 'Updating...' : '↻ Update analysis'}</button><button className="primary-button" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close form' : '+ Add opportunity'}</button></div></section><section className="panel ai-analysis"><div className="panel-heading"><div><p className="eyebrow">AI optimization</p><h2>Recommendations from your usage</h2></div><button className="primary-button" onClick={analyzeWithAi} disabled={analyzing}>{analyzing ? 'Analyzing...' : '✦ Analyze with AI'}</button></div><p className="intro-copy">Get practical cost-saving ideas based on your MongoDB usage records.</p>{aiError && <div className="auth-error">{aiError}</div>}{aiRecommendations && (aiRecommendations.length ? <div className="opportunity-grid">{aiRecommendations.map((recommendation, index) => <article className="opportunity-card" key={`${recommendation.title}-${index}`}><div className="opportunity-top"><span className="opportunity-category">{recommendation.category}</span><span className={`impact ${recommendation.impact}`}>{recommendation.impact} impact</span></div><h2>{recommendation.title}</h2><p>{recommendation.description}</p><div className="opportunity-footer"><strong>{formatCurrency(recommendation.estimated_monthly_savings)} / month (estimate)</strong></div></article>)}</div> : <p className="intro-copy">AI found no actionable recommendations in the available usage data.</p>)}</section>{showForm && <form className="panel opportunity-form" onSubmit={saveOpportunity}><div className="panel-heading"><div><p className="eyebrow">Manual opportunity</p><h2>Add optimization idea</h2></div><span className="live-pill">Updates savings</span></div><div className="opportunity-form-grid"><label>Title<input name="title" value={form.title} onChange={updateForm} placeholder="Reduce repeated prompt tokens" required /></label><label>Category<input name="category" value={form.category} onChange={updateForm} placeholder="Prompt design" required /></label><label>Monthly savings ($)<input type="number" name="estimated_monthly_savings" value={form.estimated_monthly_savings} onChange={updateForm} min="0" step="0.01" required /></label><label>Impact<select name="impact" value={form.impact} onChange={updateForm}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="wide-field">Description<textarea name="description" value={form.description} onChange={updateForm} placeholder="Describe how this change will reduce cost or improve performance." required /></label></div>{formError && <div className="auth-error">{formError}</div>}<button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Update analysis with this opportunity'}</button></form>}<section className="optimization-summary panel"><div><span className="eyebrow">Dashboard cost savings</span><strong>{formatCurrency(data.estimated_monthly_savings)}</strong></div><div><span className="eyebrow">Opportunities found</span><strong>{data.total_opportunities}</strong></div><span className="live-pill"><i />Live API</span></section><div className="opportunity-grid">{data.opportunities.map((opportunity) => <article className="opportunity-card" key={opportunity.id}><div className="opportunity-top"><span className="opportunity-category">{opportunity.category}</span><span className={`impact ${opportunity.impact}`}>{opportunity.impact} impact</span></div><h2>{opportunity.title}</h2><p>{opportunity.description}</p><div className="opportunity-footer"><strong>{formatCurrency(opportunity.estimated_monthly_savings)} / month</strong><button className="text-button">Review <span>→</span></button></div></article>)}</div></>
}
