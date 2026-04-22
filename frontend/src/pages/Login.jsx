import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
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
    if (!username.trim()) {
      setError('Username is required')
      return
    }

    setLoading(true)
    try {
      // Create auth user
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      if (authErr) throw authErr

      setEmail('')
      setPassword('')
      setUsername('')
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
          <h1 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>⚡ CogniChain</h1>
          <p className="text-secondary">Solve problems. Earn points. Think deeply.</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(''); }}
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
              onClick={() => { setTab('signup'); setError(''); }}
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

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="flex-col">
              {error && <div className="error">{error}</div>}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="flex-col">
              {error && <div className={error.includes('✓') ? 'success' : 'error'} style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
                {error}
              </div>}
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
              <button type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
