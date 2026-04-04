import { useState } from 'react'
import './AuthPage.css'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [handle, setHandle] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login'
      ? { handle, password }
      : { handle, password, name }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      onAuth(data.user)
    } catch {
      setError('Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__logo">dev-conn</h1>
        <p className="auth-card__sub">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input
              className="auth-form__input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          )}
          <input
            className="auth-form__input"
            type="text"
            placeholder="Handle (e.g. alexrivera)"
            value={handle}
            onChange={e => setHandle(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            className="auth-form__input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {error && <p className="auth-form__error">{error}</p>}
          <button className="auth-form__submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button className="auth-card__switch-btn" onClick={switchMode}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
