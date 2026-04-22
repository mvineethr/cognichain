import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import ProblemCard from '../components/ProblemCard'

const DIFFICULTY_ORDER = ['novice', 'apprentice', 'expert', 'master']
const DIFFICULTY_LABELS = {
  novice:     { label: 'Novice',     color: '#4d9cff', desc: 'Getting started' },
  apprentice: { label: 'Apprentice', color: '#00cc6a', desc: 'Building skills' },
  expert:     { label: 'Expert',     color: '#ffb84d', desc: 'Serious challenge' },
  master:     { label: 'Master',     color: '#ff6b6b', desc: 'Elite level' },
}

export default function Problems() {
  const [categories, setCategories]         = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [problems, setProblems]             = useState([])
  const [solvedIds, setSolvedIds]           = useState(new Set())
  const [dailyProblem, setDailyProblem]     = useState(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const [cats, solutions] = await Promise.all([
          api.getCategories(),
          api.mySolutions(),
        ])
        setCategories(cats)
        if (cats.length > 0) setActiveCategory(cats[0].id)
        setSolvedIds(new Set(
          (solutions || []).filter(s => s.is_correct).map(s => s.problem_id)
        ))
      } catch (err) {
        setError(err.message)
      }
      try {
        const daily = await api.getDailyProblem()
        setDailyProblem(daily)
      } catch (_) {}
    }
    init()
  }, [])

  useEffect(() => {
    if (!activeCategory) return
    const fetchProblems = async () => {
      setLoading(true)
      try {
        const result = await api.getProblems({ category: activeCategory, limit: 50 })
        setProblems(result.items || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProblems()
  }, [activeCategory])

  const problemsByDifficulty = DIFFICULTY_ORDER.reduce((acc, diff) => {
    acc[diff] = problems.filter(p => p.difficulty === diff)
    return acc
  }, {})

  const totalSolvedInCategory = problems.filter(p => solvedIds.has(p.id)).length
  const progressPct = problems.length > 0
    ? Math.round((totalSolvedInCategory / problems.length) * 100)
    : 0

  return (
    <div className="flex-col">
      {error && <div className="error">{error}</div>}

      {dailyProblem && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,204,106,0.15), rgba(0,204,106,0.05))',
          border: '1px solid rgba(0,204,106,0.4)',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '0.5rem',
        }}>
          <div>
            <p className="text-sm text-accent" style={{ margin: '0 0 0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              ⭐ DAILY CHALLENGE
            </p>
            <h3 style={{ margin: 0 }}>{dailyProblem.title}</h3>
            <p className="text-sm text-secondary" style={{ margin: '0.25rem 0 0' }}>
              {dailyProblem.category_name} · {dailyProblem.difficulty} · +{dailyProblem.token_reward + 25} pts with bonus
            </p>
          </div>
          <a href={`/solve/${dailyProblem.id}`} style={{ textDecoration: 'none' }}>
            <button style={{ whiteSpace: 'nowrap' }}>Solve Today's Problem</button>
          </a>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.6rem 1.2rem',
              background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-card)',
              color: activeCategory === cat.id ? 'var(--bg-dark)' : 'var(--text-secondary)',
              border: activeCategory === cat.id ? 'none' : '1px solid var(--border)',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              fontWeight: activeCategory === cat.id ? 700 : 400,
              transition: 'all 0.2s',
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Progress */}
      {!loading && problems.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-secondary">{totalSolvedInCategory} / {problems.length} solved</span>
            <span className="text-sm text-accent" style={{ fontWeight: 600 }}>{progressPct}%</span>
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPct}%`, height: '100%',
              background: 'var(--accent)', borderRadius: '20px',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* Problems by Difficulty */}
      {loading ? (
        <div className="loading">Loading problems...</div>
      ) : problems.length === 0 ? (
        <div className="text-center text-secondary" style={{ padding: '3rem' }}>
          No problems in this category yet.
        </div>
      ) : (
        <div className="flex-col">
          {DIFFICULTY_ORDER.map(diff => {
            const group = problemsByDifficulty[diff]
            if (group.length === 0) return null
            const { label, color, desc } = DIFFICULTY_LABELS[diff]
            const solvedInGroup = group.filter(p => solvedIds.has(p.id)).length
            return (
              <div key={diff} style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '1rem', paddingBottom: '0.75rem',
                  borderBottom: `2px solid ${color}30`,
                }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <h3 style={{ margin: 0, color }}>{label}</h3>
                  <span className="text-sm text-muted">— {desc}</span>
                  <span className="text-sm" style={{
                    marginLeft: 'auto', color,
                    background: `${color}15`,
                    padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600,
                  }}>
                    {solvedInGroup}/{group.length}
                  </span>
                </div>
                <div className="grid grid-3">
                  {group.map(p => (
                    <div key={p.id} style={{ position: 'relative' }}>
                      {solvedIds.has(p.id) && (
                        <div style={{
                          position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 1,
                          background: 'var(--accent)', borderRadius: '50%',
                          width: '24px', height: '24px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', color: 'var(--bg-dark)', fontWeight: 700,
                        }}>✓</div>
                      )}
                      <ProblemCard problem={p} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
