import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import GuideChat from '../components/GuideChat'

const DIFF_COLORS = {
  novice:     'var(--diff-novice)',
  apprentice: 'var(--diff-apprentice)',
  expert:     'var(--diff-expert)',
  master:     'var(--diff-master)',
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function Solve() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem]     = useState(null)
  const [solution, setSolution]   = useState('')
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [result, setResult]       = useState(null)
  const [elapsed, setElapsed]     = useState(0)
  const startRef = useRef(Date.now())
  const timerRef = useRef(null)

  useEffect(() => {
    api.getProblem(id)
      .then(setProblem)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!solution.trim()) { setError('Please enter a solution'); return }
    clearInterval(timerRef.current)
    setSubmitting(true)
    setError('')
    try {
      const res = await api.submitSolution({
        problem_id:      id,
        content:         solution,
        time_taken_secs: elapsed,
      })
      setResult(res)
      setSolution('')
      if (res.is_correct) {
        setTimeout(() => navigate('/'), 2500)
      } else {
        // Resume timer if wrong
        startRef.current = Date.now() - elapsed * 1000
        timerRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
        }, 1000)
      }
    } catch (err) {
      setError(err.message)
      // Resume timer on error
      startRef.current = Date.now() - elapsed * 1000
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
      }, 1000)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading">Loading problem...</div>
  if (!problem) return <div className="error">{error || 'Problem not found'}</div>

  const diffColor = DIFF_COLORS[problem.difficulty] || 'var(--accent)'
  const icon = problem.category_icon || '❓'

  return (
    <div className="solve-grid">

      {/* ── Problem Panel ───────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto' }}>

        {/* Problem card */}
        <div className="card">
          {/* Title row */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: '0 0 0.5rem' }}>{problem.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge secondary">{problem.category_name}</span>
                <span className="badge" style={{
                  background: `${diffColor}18`, color: diffColor,
                }}>
                  {problem.difficulty}
                </span>
                {problem.is_daily && (
                  <span className="badge gold">⭐ Daily +25 bonus</span>
                )}
                <span className="badge primary" style={{ marginLeft: 'auto' }}>
                  +{problem.token_reward} pts
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{
            background: 'var(--bg-darker)', padding: '1.25rem',
            borderRadius: '8px', lineHeight: 1.8,
            color: 'var(--text-secondary)', fontSize: '1rem',
            border: '1px solid var(--border)',
          }}>
            {problem.body}
          </div>

          {/* Meta */}
          <div style={{
            display: 'flex', gap: '1.5rem', marginTop: '1rem',
            padding: '0.75rem 0', borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            <span className="text-sm text-muted">
              <strong style={{ color: 'var(--text-secondary)' }}>Answer type:</strong>{' '}
              {problem.answer_type === 'exact' ? 'Exact match' : problem.answer_type === 'numeric' ? 'Numeric' : 'Peer reviewed'}
            </span>
            <span className="text-sm text-muted">
              <strong style={{ color: 'var(--text-secondary)' }}>Solved by:</strong>{' '}
              {problem.solve_count} users
            </span>
            <span className="text-sm mono" style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
              ⏱ {formatTime(elapsed)}
            </span>
          </div>
        </div>

        {/* Submit card */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Your Solution</h3>

          {error && <div className="error">{error}</div>}

          {result && (
            <div className={result.is_correct ? 'success' : 'warning'} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{result.is_correct ? '🎉' : '🤔'}</span>
                <strong>{result.is_correct ? 'Correct!' : 'Not quite yet'}</strong>
              </div>
              <p style={{ margin: 0 }}>{result.message}</p>
              {result.badges_earned?.length > 0 && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                  🏆 Badges: {result.badges_earned.join(', ')}
                </p>
              )}
              {result.is_correct && (
                <p className="text-sm" style={{ marginTop: '0.5rem', opacity: 0.75 }}>
                  Redirecting to feed in 2 seconds...
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea
              value={solution}
              onChange={e => setSolution(e.target.value)}
              placeholder={
                problem.answer_type === 'peer_review'
                  ? 'Write your full explanation...'
                  : problem.answer_type === 'numeric'
                  ? 'Enter a number...'
                  : 'Enter your exact answer...'
              }
              disabled={submitting || result?.is_correct}
              style={{ minHeight: '120px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-sm text-muted">
                {problem.answer_type === 'peer_review'
                  ? 'Peer-reviewed — any thoughtful answer earns points'
                  : 'Case-insensitive match'}
              </span>
              <button
                type="submit"
                disabled={submitting || !solution.trim() || result?.is_correct}
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── AI Guide Panel ───────────────────────────────────── */}
      <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <GuideChat problemId={id} />
      </div>

    </div>
  )
}
