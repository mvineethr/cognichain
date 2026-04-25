import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import GuideChat from '../components/GuideChat'
import { useAuth } from '../context/AuthContext'
import {
  GUEST_MAX_SOLVES,
  recordGuestSolve,
  getGuestSolveCount,
  guestSolveLimitReached,
  guestSolvesRemaining,
} from '../lib/guest'

const DIFF_COLORS = {
  novice:     'var(--diff-novice)',
  apprentice: 'var(--diff-apprentice)',
  expert:     'var(--diff-expert)',
  master:     'var(--diff-master)',
}

// How long before nudging user toward the guide (ms)
const GUIDE_HINT_DELAY = 90_000 // 90 seconds

const SHARE_URL = typeof window !== 'undefined' ? window.location.origin : ''

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

// Safe back navigation — falls back to /problems if there's no history
function goBackOrFallback(navigate) {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    navigate(-1)
  } else {
    navigate('/problems')
  }
}

export default function Solve() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isGuest } = useAuth()
  const [problem, setProblem]       = useState(null)
  const [showGate, setShowGate]     = useState(false)  // signup gate after limit
  const [solution, setSolution]     = useState('')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [result, setResult]         = useState(null)
  const [elapsed, setElapsed]       = useState(0)
  const [mobileTab, setMobileTab]   = useState('problem')
  const [guideHint, setGuideHint]   = useState(false)
  const [wrongPopup, setWrongPopup] = useState(null)   // { message } | null
  const [shareOpen, setShareOpen]   = useState(false)

  const startRef    = useRef(Date.now())
  const timerRef    = useRef(null)
  const hintRef     = useRef(null)
  const popupRef    = useRef(null)   // setTimeout for auto-dismiss

  // ── Tick that re-derives elapsed from startRef (drift-proof) ──
  const tick = useCallback(() => {
    setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
  }, [])

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

    // Elapsed timer — recomputes from startRef each tick
    timerRef.current = setInterval(tick, 1000)

    // Re-sync timer when tab becomes visible again (mobile pauses setInterval)
    const onVis = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', onVis)

    // Guide hint timer
    startHintTimer()

    return () => {
      clearInterval(timerRef.current)
      clearTimeout(hintRef.current)
      clearTimeout(popupRef.current)
      document.removeEventListener('visibilitychange', onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ── Open guide (clears hint, switches mobile tab) ──────────────
  const openGuide = useCallback(() => {
    clearHint()
    setMobileTab('guide')
  }, [clearHint])

  // ── Wrong answer popup ────────────────────────────────────────
  const showWrongAnswer = useCallback((message) => {
    clearTimeout(popupRef.current)
    setWrongPopup({ message })
    popupRef.current = setTimeout(() => setWrongPopup(null), 3500)
  }, [])

  const dismissPopup = useCallback(() => {
    clearTimeout(popupRef.current)
    setWrongPopup(null)
  }, [])

  // ── Resume elapsed timer (after submit pause) ─────────────────
  const resumeTimer = useCallback(() => {
    startRef.current = Date.now() - elapsed * 1000
    clearInterval(timerRef.current)
    timerRef.current = setInterval(tick, 1000)
  }, [elapsed, tick])

  // ── Submit solution ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!solution.trim()) { setError('Please enter a solution'); return }

    // Guest limit check (before hitting API)
    if (isGuest && guestSolveLimitReached() && !result?.is_correct) {
      setShowGate(true)
      return
    }

    clearInterval(timerRef.current)
    clearHint()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        problem_id:      id,
        content:         solution,
        time_taken_secs: elapsed,
      }
      const res = isGuest
        ? await api.guestCheckSolution(payload)
        : await api.submitSolution(payload)
      setResult(res)
      setSolution('')
      if (res.is_correct) {
        if (isGuest) {
          recordGuestSolve(id)
          // Show gate immediately if this was their last allowed solve
          if (guestSolveLimitReached()) {
            setTimeout(() => setShowGate(true), 1500)
          }
        }
        try { window.plausible?.('Problem Solved', { props: { difficulty: problem?.difficulty, guest: isGuest } }) } catch {}
      } else {
        // Wrong — show popup, resume timer, restart hint countdown
        showWrongAnswer(res.message)
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

  // ── Share helpers ─────────────────────────────────────────────
  const shareText = problem
    ? `I just solved "${problem.title}" on CogniChain 🧠⚡ Try it: ${SHARE_URL}`
    : ''

  const shareLinks = {
    twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    reddit:   `https://www.reddit.com/submit?title=${encodeURIComponent(problem?.title || 'CogniChain')}&url=${encodeURIComponent(SHARE_URL)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
  }

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      try { window.plausible?.('Share Copied') } catch {}
    } catch {}
  }

  if (loading) return <div className="loading">Loading problem...</div>
  if (!problem) return <div className="error">{error || 'Problem not found'}</div>

  const diffColor = DIFF_COLORS[problem.difficulty] || 'var(--accent)'
  const icon      = problem.category_icon || '❓'

  const guestRemaining = isGuest ? guestSolvesRemaining() : null

  return (
    <>
    {/* ── Guest signup gate (after limit) ───────────────────── */}
    {showGate && (
      <div className="onboard-overlay" onClick={() => setShowGate(false)}>
        <div className="onboard-card" onClick={e => e.stopPropagation()}>
          <div className="onboard-step-icon">🎉</div>
          <h2 style={{ margin: '0 0 0.5rem', textAlign: 'center' }}>
            You've used your {GUEST_MAX_SOLVES} free solves
          </h2>
          <p style={{ margin: 0, textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Sign up free to keep solving, save your progress, earn points, and join the leaderboard.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%' }}>✨ Create free account</button>
            </Link>
            <button onClick={() => setShowGate(false)} className="secondary">
              Not yet
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Wrong answer popup ───────────────────────────────── */}
    {wrongPopup && (
      <div className="wrong-popup" onClick={dismissPopup}>
        <div className="wrong-popup-inner">
          <span style={{ fontSize: '1.4rem' }}>🤔</span>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Not quite yet</strong>
            <span style={{ fontSize: '0.88rem', opacity: 0.85 }}>{wrongPopup.message}</span>
          </div>
          <button
            onClick={dismissPopup}
            style={{
              background: 'none', border: 'none', color: 'inherit',
              opacity: 0.6, cursor: 'pointer', fontSize: '1.1rem',
              padding: '0 0.25rem', flexShrink: 0,
            }}
          >✕</button>
        </div>
      </div>
    )}

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
        {/* Guest banner */}
        {isGuest && (
          <div className="guest-banner">
            <span>👀 <strong>Guest mode</strong> · {guestRemaining} of {GUEST_MAX_SOLVES} free solves left</span>
            <Link to="/login" className="guest-banner-link">Sign up free →</Link>
          </div>
        )}

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
                {problem.is_daily && !isGuest && <span className="badge gold">⭐ Daily +25 bonus</span>}
                <span
                  className="badge primary"
                  style={{
                    marginLeft: 'auto',
                    ...(isGuest ? { opacity: 0.4, background: 'var(--bg-darker)', color: 'var(--text-muted)' } : {}),
                  }}
                  title={isGuest ? 'Sign up to earn points' : ''}
                >
                  {isGuest ? '— pts (sign up to earn)' : `+${problem.token_reward} pts`}
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

              {/* ── Share-after-solve ── */}
              {result.is_correct && !isGuest && (
                <div style={{ marginTop: '1rem' }}>
                  <p className="text-sm" style={{ margin: '0 0 0.5rem', opacity: 0.8 }}>
                    Share your win and challenge your friends:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a href={shareLinks.twitter}  target="_blank" rel="noopener noreferrer" className="share-btn">𝕏 Twitter</a>
                    <a href={shareLinks.reddit}   target="_blank" rel="noopener noreferrer" className="share-btn">🔶 Reddit</a>
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="share-btn">💬 WhatsApp</a>
                    <button onClick={copyShare} className="share-btn" type="button">📋 Copy</button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => goBackOrFallback(navigate)}
                      className="secondary"
                      style={{ flex: 1 }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/problems')}
                      style={{ flex: 1 }}
                    >
                      Solve another →
                    </button>
                  </div>
                </div>
              )}

              {/* Guest after-solve — push toward signup */}
              {result.is_correct && isGuest && (
                <div style={{ marginTop: '1rem' }}>
                  <p className="text-sm" style={{ margin: '0 0 0.75rem', opacity: 0.85 }}>
                    {guestSolveLimitReached()
                      ? '🎯 That was your last free solve. Create a free account to keep going.'
                      : `${guestSolvesRemaining()} of ${GUEST_MAX_SOLVES} free solves left. Sign up to save your progress and earn points.`}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/login" style={{ flex: 1, textDecoration: 'none' }}>
                      <button style={{ width: '100%' }}>✨ Sign up free</button>
                    </Link>
                    {!guestSolveLimitReached() && (
                      <button
                        type="button"
                        onClick={() => navigate('/problems')}
                        className="secondary"
                        style={{ flex: 1 }}
                      >
                        Next problem →
                      </button>
                    )}
                  </div>
                </div>
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
    </>
  )
}
