import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { getGuestSolveIds } from '../lib/guest'

const DIFF_COLORS = {
  novice:     'var(--diff-novice)',
  apprentice: 'var(--diff-apprentice)',
  expert:     'var(--diff-expert)',
  master:     'var(--diff-master)',
  legend:     'var(--diff-legend)',
}

const CAT_ICONS = {
  Math:       '📐',
  Science:    '🔬',
  Logic:      '🧩',
  Puzzles:    '🔮',
  Aptitude:   '⚡',
  Mystery:    '🔍',
  Social:     '🤝',
  Hypothetical: '💭',
}

export default function Daily() {
  const { isGuest } = useAuth()
  const [dailySet, setDailySet]   = useState(null)
  const [profile, setProfile]     = useState(null)
  const [solvedIds, setSolvedIds] = useState(new Set())
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        if (isGuest) {
          // Guests: skip profile + solutions (auth-required); use localStorage instead
          const ds = await api.getDailySet()
          setDailySet(ds)
          setSolvedIds(new Set(getGuestSolveIds()))
        } else {
          const [ds, prof, sols] = await Promise.all([
            api.getDailySet(),
            api.getMyProfile(),
            api.mySolutions(),
          ])
          setDailySet(ds)
          setProfile(prof)
          setSolvedIds(new Set(
            (sols || []).filter(s => s.is_correct).map(s => s.problem_id)
          ))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [isGuest])

  if (loading) return <div className="loading">Loading today's challenges...</div>
  if (error)   return <div className="error">{error}</div>

  const allProblems = [...(dailySet?.daily || []), ...(dailySet?.spotlight || [])]
  const solvedToday = allProblems.filter(p => solvedIds.has(p.id)).length
  const totalToday  = allProblems.length
  const progressPct = totalToday > 0 ? Math.round((solvedToday / totalToday) * 100) : 0

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="flex-col" style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(110,231,168,0.1), rgba(0,0,0,0))',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <p className="text-muted text-sm" style={{ margin: '0 0 0.25rem' }}>📅 {dateStr}</p>
          <h2 style={{ margin: '0 0 0.5rem' }}>Today's Challenges</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
              {solvedToday}/{totalToday} completed
            </span>
            {profile?.streak > 0 && (
              <span style={{
                background: 'rgba(255,184,77,0.15)', color: '#ffb84d',
                padding: '0.25rem 0.75rem', borderRadius: '20px',
                fontSize: '0.9rem', fontWeight: 600,
              }}>
                🔥 {profile.streak} day streak
              </span>
            )}
            {solvedToday === totalToday && totalToday > 0 && (
              <span style={{
                background: 'rgba(110,231,168,0.15)', color: 'var(--accent)',
                padding: '0.25rem 0.75rem', borderRadius: '20px',
                fontSize: '0.9rem', fontWeight: 600,
              }}>
                ✨ All done!
              </span>
            )}
          </div>
        </div>

        {/* Progress ring */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: `conic-gradient(var(--accent) ${progressPct * 3.6}deg, var(--bg-darker) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--bg-card)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)',
            }}>
              {progressPct}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Featured Daily Challenge ── */}
      {dailySet?.daily?.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{
              background: 'rgba(110,231,168,0.15)', color: 'var(--accent)',
              padding: '0.3rem 0.75rem', borderRadius: '20px',
              fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em',
            }}>
              ⭐ DAILY CHALLENGE
            </span>
            <span className="text-muted text-sm">+25 bonus points</span>
          </div>

          {dailySet.daily.map(p => (
            <FeaturedCard key={p.id} problem={p} solved={solvedIds.has(p.id)} />
          ))}
        </div>
      )}

      {/* ── Brain Gym ── */}
      {dailySet?.spotlight?.length > 0 && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '0 0 0.25rem' }}>🧠 Brain Gym</h3>
            <p className="text-sm text-muted" style={{ margin: 0 }}>
              Extra challenges from different categories — refreshed daily
            </p>
          </div>
          <div className="grid grid-3" style={{ gap: '1rem' }}>
            {dailySet.spotlight.map(p => (
              <BrainGymCard key={p.id} problem={p} solved={solvedIds.has(p.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!dailySet?.daily?.length && !dailySet?.spotlight?.length && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌙</div>
          <h3>No challenges today yet</h3>
          <p>Check back soon — new challenges drop at midnight.</p>
        </div>
      )}

      {/* Refreshes note */}
      {totalToday > 0 && (
        <p className="text-muted text-sm" style={{ textAlign: 'center', marginTop: '2rem' }}>
          🔄 New challenges every day at midnight
        </p>
      )}
    </div>
  )
}

/* ── Featured challenge card ── */
function FeaturedCard({ problem, solved }) {
  const icon  = CAT_ICONS[problem.category_name] || problem.category_icon || '❓'
  const color = DIFF_COLORS[problem.difficulty] || 'var(--accent)'

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: solved ? '1px solid rgba(110,231,168,0.5)' : '1px solid var(--border)',
      borderLeft: `4px solid ${color}`,
      borderRadius: '12px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 24px ${color}18`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {solved && (
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'var(--accent)', color: 'var(--bg-dark)',
          borderRadius: '50%', width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1rem',
        }}>✓</div>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 0.4rem', paddingRight: solved ? '2.5rem' : 0 }}>
            {problem.title}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge secondary">{problem.category_name}</span>
            <span style={{
              fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem',
              borderRadius: '8px', background: `${color}18`, color,
            }}>
              {problem.difficulty}
            </span>
            <span className="badge primary">+{(problem.token_reward || 0) + 25} pts</span>
          </div>
        </div>
      </div>

      <p style={{
        color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1.25rem',
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {problem.body}
      </p>

      <Link to={`/solve/${problem.id}`} style={{ textDecoration: 'none' }}>
        <button style={{ width: '100%' }} disabled={solved}>
          {solved ? '✓ Solved Today' : '⭐ Start Challenge →'}
        </button>
      </Link>
    </div>
  )
}

/* ── Brain gym card ── */
function BrainGymCard({ problem, solved }) {
  const icon  = CAT_ICONS[problem.category_name] || problem.category_icon || '❓'
  const color = DIFF_COLORS[problem.difficulty] || 'var(--accent)'

  return (
    <Link to={`/solve/${problem.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: solved ? '1px solid rgba(110,231,168,0.4)' : '1px solid var(--border)',
        borderTop: `3px solid ${color}`,
        borderRadius: '10px',
        padding: '1.25rem',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
        boxSizing: 'border-box',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 6px 20px ${color}18`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {solved && (
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'var(--accent)', color: 'var(--bg-dark)',
            borderRadius: '50%', width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem',
          }}>✓</div>
        )}
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
        <h4 style={{ margin: '0 0 0.5rem', paddingRight: solved ? '2rem' : 0, fontSize: '0.95rem' }}>
          {problem.title}
        </h4>
        <p style={{
          margin: '0 0 0.75rem', fontSize: '0.82rem',
          color: 'var(--text-muted)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {problem.category_name}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.75rem', color, background: `${color}18`,
            padding: '0.15rem 0.5rem', borderRadius: '8px', fontWeight: 600,
          }}>
            {problem.difficulty}
          </span>
          <span className="text-sm text-accent" style={{ marginLeft: 'auto', fontWeight: 600 }}>
            +{problem.token_reward} pts
          </span>
        </div>
      </div>
    </Link>
  )
}
