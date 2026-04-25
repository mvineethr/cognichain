import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'cognichain_onboarded_v1'

const STEPS = [
  {
    icon:  '👋',
    title: 'Welcome to CogniChain',
    body:  'A place to sharpen your thinking with daily problems — math, science, logic, puzzles, and more.',
  },
  {
    icon:  '🧠',
    title: 'Solve, earn, repeat',
    body:  'Each correct answer earns points. Build streaks, climb the leaderboard, and unlock badges.',
  },
  {
    icon:  '💡',
    title: 'Stuck? Ask the AI Guide',
    body:  'Every problem has a Socratic AI that nudges you toward the answer — it teaches, never spoils.',
  },
]

export default function OnboardingModal() {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Slight delay so it doesn't pop on first paint
      const t = setTimeout(() => setOpen(true), 400)
      return () => clearTimeout(t)
    }
  }, [])

  const close = (action) => {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
    if (action === 'daily')    navigate('/daily')
    if (action === 'problems') navigate('/problems')
    try { window.plausible?.('Onboarding Done', { props: { action: action || 'skip' } }) } catch {}
  }

  if (!open) return null

  const isLast = step === STEPS.length - 1
  const s = STEPS[step]

  return (
    <div className="onboard-overlay" onClick={() => close('skip')}>
      <div className="onboard-card" onClick={e => e.stopPropagation()}>
        <div className="onboard-step-icon">{s.icon}</div>
        <h2 style={{ margin: '0 0 0.5rem', textAlign: 'center' }}>{s.title}</h2>
        <p style={{
          margin: 0,
          textAlign: 'center',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          {s.body}
        </p>

        <div className="onboard-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`onboard-dot${i === step ? ' active' : ''}`} />
          ))}
        </div>

        {isLast ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={() => close('daily')}>
              ⭐ Start with today's challenge
            </button>
            <button onClick={() => close('problems')} className="secondary">
              🧩 Browse all problems
            </button>
            <button
              onClick={() => close('skip')}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.85rem', padding: '0.5rem',
              }}
            >
              Maybe later
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              onClick={() => close('skip')}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.85rem',
              }}
            >
              Skip
            </button>
            <button onClick={() => setStep(step + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
