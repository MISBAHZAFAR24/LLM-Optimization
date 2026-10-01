import { useEffect, useState } from 'react'
import { formatCurrency, getModelCosts } from '../services/api.js'

export default function Models() {
	const [models, setModels] = useState(null)
	const [error, setError] = useState('')
	useEffect(() => { getModelCosts().then(setModels).catch((requestError) => setError(requestError.message)) }, [])
	if (error) return <div className="loading-state error-state">Could not load models: {error}</div>
	if (!models) return <div className="loading-state">Loading connected models...</div>
	return <><section className="page-intro"><div><p className="eyebrow">Model catalog · {models.length} connected</p><h1>Your model stack, in one place.</h1><p className="intro-copy">Compare live spend and request volume across your connected providers.</p></div><button className="primary-button">+ Connect model</button></section><div className="model-grid">{models.map((model) => <article className="model-card" key={model.model}><div className="model-badge">{model.provider[0]}</div><div><p>{model.provider}</p><h2>{model.model}</h2></div><span className="status"><i />Active</span><div className="model-metrics"><span><small>Spend</small><strong>{formatCurrency(model.spend)}</strong></span><span><small>Share</small><strong>{model.share}%</strong></span><span><small>Requests</small><strong>{model.requests.toLocaleString()}</strong></span></div></article>)}</div></>
}
