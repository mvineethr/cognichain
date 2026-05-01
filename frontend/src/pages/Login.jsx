import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { GUEST_MAX_SOLVES, GUEST_MAX_GUIDE_PER_PROB } from '../lib/guest'

export default function Login() {
  const { startGuest } = useAuth()
  const [tab, setTab]           = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [agreed, setAgreed]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) { setError('Username is required'); return }
    if (!agreed) { setError('You must agree to the Terms of Service and Privacy Policy'); return }

    setLoading(true)
    try {
      const { error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      if (authErr) throw authErr
      setEmail('')
      setPassword('')
      setUsername('')
      setAgreed(false)
      setError('')
      setTab('signin')
      setError('✓ Account created! Sign in to continue.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>🧩 Puzzld</h1>
          <p className="text-secondary">Solve problems. Earn points. Think deeply.</p>
        </div>

        <div className="card">
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { setTab('signin'); setError('') }}
              style={{
                flex: 1,
                background: tab === 'signin' ? 'var(--accent)' : 'var(--bg-darker)',
                color: tab === 'signin' ? 'var(--bg-dark)' : 'var(--text-secondary)',
                border: tab === 'signin' ? 'none' : '1px solid var(--border)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setError('') }}
              style={{
                flex: 1,
                background: tab === 'signup' ? 'var(--accent)' : 'var(--bg-darker)',
                color: tab === 'signup' ? 'var(--bg-dark)' : 'var(--text-secondary)',
                border: tab === 'signup' ? 'none' : '1px solid var(--border)',
              }}
            >
              Sign Up
            </button>
          </div>

          {/* ── Sign In ── */}
          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="flex-col">
              {error && (
                <div className={error.includes('✓') ? 'success' : 'error'} style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
                  {error}
                </div>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

          ) : (
            /* ── Sign Up ── */
            <form onSubmit={handleSignUp} className="flex-col">
              {error && (
                <div className={error.includes('✓') ? 'success' : 'error'} style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
                  {error}
                </div>
              )}
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />

              {/* Agreement checkbox */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                cursor: 'pointer', padding: '0.75rem',
                background: agreed ? 'rgba(110,231,168,0.06)' : 'var(--bg-darker)',
                border: `1px solid ${agreed ? 'rgba(110,231,168,0.3)' : 'var(--border)'}`,
                borderRadius: '8px', transition: 'all 0.2s',
                fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  disabled={loading}
                  style={{
                    width: '16px', height: '16px', marginTop: '2px',
                    accentColor: 'var(--accent)', flexShrink: 0,
                  }}
                />
                <span>
                  I agree to the{' '}
                  <Link
                    to="/tos"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                    onClick={e => e.stopPropagation()}
                  >
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                    onClick={e => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                  , including the use of my anonymized session data to train AI models.
                </span>
              </label>

              <button type="submit" disabled={loading || !agreed} style={{ width: '100%' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── Guest mode ── */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <p className="text-sm text-muted" style={{ margin: '0 0 0.6rem' }}>
              Just want to look around?
            </p>
            <button
              type="button"
              onClick={() => { startGuest(); navigate('/daily') }}
              className="secondary"
              style={{ width: '100%' }}
            >
              👀 Try without signing in
            </button>
            <p className="text-sm text-muted" style={{ margin: '0.6rem 0 0', fontSize: '0.78rem' }}>
              {GUEST_MAX_SOLVES} free problems · {GUEST_MAX_GUIDE_PER_PROB} guide messages each · no points or leaderboard
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1.5rem',
          marginTop: '1.5rem', fontSize: '0.8rem',
        }}>
          <Link to="/tos" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
