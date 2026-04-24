import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import GuideChat from '../components/GuideChat'

const isMobile = () => window.innerWidth <= 768

const DIFF_COLORS = {
  novice:     'var(--diff-novice)',
  apprentice: 'var(--diff-apprentice)',
  expert:     'var(--diff-expert)',
  master:     'var(--diff-master)',
}

// How long before nudging user toward the guide (ms)
const GUIDE_HINT_DELAY = 90_000 // 90 seconds

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function Solve() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem]       = useState(null)
  const [solution, setSolution]     = useState('')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [result, setResult]         = useState(null)
  const [elapsed, setElapsed]       = useState(0)
  const [mobileTab, setMobileTab]   = useState('problem')
  const [guideHint, setGuideHint]   = useState(false)   // ← hint state

  const startRef    = useRef(Date.now())
  const timerRef    = useRef(null)
  const hintRef     = useRef(null)    // setTimeout for guide hint

  // ── Start / clear the guide hint timer ────────────────────────
  const startHintTimer = useCallback(() => {
    clearTimeout(hintRef.current)
    hintRef.current = setTimeout(() => setGuideHint(true), GUIDE_HINT_DELAY)
  }, [])

  const clearHint = useCallback(() => {
    setGuideHint(false)
    clearTimeout(hintRef.current)
  }, [])

  // ── On mount: load problem, start timers ───────────────────────
  useEffect(() => {
    window.scrollTo(0, 0)

    api.getProblem(id)
      .then(setProblem)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    // Elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)

    // Guide hint timer
    startHintTimer()

    return () => {
      clearInterval(timerRef.current)
      clearTimeout(hintRef.current)
    }
  }, [id])

  // ── Open guide (clears hint, switches mobile tab) ──────────────
  const openGuide = useCallback(() => {
    clearHint()
    setMobileTab('guide')
  }, [clearHint])

  // ── Resume elapsed timer ───────────────────────────────────────
  const resumeTimer = useCallback(() => {
    startRef.current = Date.now() - elapsed * 1000
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
  }, [elapsed])

  // ── Submit solution ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!solution.trim()) { setError('Please enter a solution'); return }
    clearInterval(timerRef.current)
    clearHint()
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
        // Wrong — resume timer and restart hint countdown
        resumeTimer()
        startHintTimer()
      }
    } catch (err) {
      setError(err.message)
      resumeTimer()
      startHintTimer()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading">Loading problem...</div>
  if (!problem) return <div className="error">{error || 'Problem not found'}</div>

  const diffColor = DIFF_COLORS[problem.difficulty] || 'var(--accent)'
  const icon      = problem.category_icon || '❓'

  return (
    <div className="solve-grid">

      {/* ── Mobile tab bar ──────────────────────────────────── */}
      <div className="solve-mobile-tabs">
        <button
          className={mobileTab === 'problem' ? 'active' : ''}
          onClick={() => { setMobileTab('problem'); }}
        >
          📋 Problem
        </button>
        <button
          className={`${mobileTab === 'guide' ? 'active' : ''}${guideHint ? ' guide-hint-tab' : ''}`}
          onClick={openGuide}
        >
          {guideHint ? '💡 Stuck? Try Guide' : '💡 Guide'}
        </button>
      </div>

      {/* ── Problem Panel ───────────────────────────────────── */}
      <div
        className={`solve-panel${mobileTab !== 'problem' ? ' solve-panel-hidden' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto' }}
      >
        {/* Problem card */}
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: '0 0 0.5rem' }}>{problem.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge secondary">{problem.category_name}</span>
                <span className="badge" style={{ background: `${diffColor}18`, color: diffColor }}>
                  {problem.difficulty}
                </span>
                {problem.is_daily && <span className="badge gold">⭐ Daily +25 bonus</span>}
                <span className="badge primary" style={{ marginLeft: 'auto' }}>
                  +{problem.token_reward} pts
                </span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-darker)', padding: '1.25rem',
            borderRadius: '8px', lineHeight: 1.8,
            color: 'var(--text-secondary)', fontSize: '1rem',
            border: '1px solid var(--border)',
          }}>
            {problem.body}
          </div>

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Your Solution</h3>
            {/* Guide nudge — visible on desktop when hint active */}
            {guideHint && (
              <button
                onClick={openGuide}
                className="guide-hint-desktop-btn"
              >
                💡 Need a hint?
              </button>
            )}
          </div>

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
              <button type="submit" disabled={submitting || !solution.trim() || result?.is_correct}>
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── AI Guide Panel ───────────────────────────────────── */}
      <div
        className={`solve-panel${mobileTab !== 'guide' ? ' solve-panel-hidden' : ''}${guideHint ? ' guide-hint-panel' : ''}`}
        style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <GuideChat problemId={id} onFirstMessage={clearHint} />
      </div>

    </div>
  )
}
