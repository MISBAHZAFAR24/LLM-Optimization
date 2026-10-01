import { useState } from 'react'
import { login, register } from '../services/api.js'

export default function Auth({ onAuthenticated, notice = '' }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(notice)
  const [loading, setLoading] = useState(false)
  const isRegister = mode === 'register'

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = isRegister ? await register(form) : await login({ email: form.email, password: form.password })
      localStorage.setItem('promptly_token', result.access_token)
      localStorage.setItem('promptly_user', JSON.stringify(result.user))
      onAuthenticated(result.user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <main className="auth-page"><section className="auth-brand"><div className="brand"><span className="brand-mark">◇</span><span>Promptly</span></div><div className="auth-quote"><span>LLM COST OPTIMIZATION</span><h1>Make every token count.</h1><p>One clear view of your AI stack, from usage to savings.</p></div><div className="auth-stat"><strong>$3,184</strong><span>estimated savings found this month</span></div></section><section className="auth-form-wrap"><div className="auth-form"><div className="auth-mobile-brand"><span className="brand-mark">◇</span> Promptly</div><p className="eyebrow">{isRegister ? 'Create workspace access' : 'Welcome back'}</p><h2>{isRegister ? 'Start optimizing today.' : 'Sign in to your workspace.'}</h2><p className="auth-subtitle">{isRegister ? 'Create your account to connect your LLM providers.' : 'Enter your details to continue to your dashboard.'}</p><form onSubmit={submit}>{isRegister && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Jordan Davis" required /></label>}<label>Email address<input type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input type="password" name="password" value={form.password} onChange={update} placeholder={isRegister ? 'At least 8 characters' : 'Your password'} minLength={isRegister ? '8' : undefined} autoComplete={isRegister ? 'new-password' : 'current-password'} required /></label>{error && <div className="auth-error">{error}</div>}<button className="primary-button auth-submit" disabled={loading}>{loading ? 'Connecting...' : isRegister ? 'Create account' : 'Sign in'}</button></form><p className="auth-switch">{isRegister ? 'Already have an account?' : "Don't have an account?"} <button onClick={() => { setMode(isRegister ? 'login' : 'register'); setError('') }}>{isRegister ? 'Sign in' : 'Create one'}</button></p></div></section></main>
}
