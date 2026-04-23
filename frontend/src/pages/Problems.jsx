import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const DIFFICULTY_ORDER = ['novice', 'apprentice', 'expert', 'master']
const DIFFICULTY_META = {
  novice:     { label: 'Novice',     color: '#4d9cff', bg: 'rgba(77,156,255,0.1)',  desc: 'Entry level — build your foundation', pts: 10 },
  apprentice: { label: 'Apprentice', color: '#00cc6a', bg: 'rgba(0,204,106,0.1)',   desc: 'Intermediate — sharpen your skills',  pts: 20 },
  expert:     { label: 'Expert',     color: '#ffb84d', bg: 'rgba(255,184,77,0.1)',  desc: 'Advanced — serious challenge',         pts: 40 },
  master:     { label: 'Master',     color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', desc: 'Elite — prove your mastery',          pts: 80 },
}

const CATEGORY_STYLES = {
  'Math':      { gradient: 'linear-gradient(135deg, #1a3a6b, #0d1f3c)', accent: '#4d9cff', glow: 'rgba(77,156,255,0.3)' },
  'Science':   { gradient: 'linear-gradient(135deg, #2d1b4e, #150d2a)', accent: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
  'Puzzles':   { gradient: 'linear-gradient(135deg, #4a1f00, #2a1000)', accent: '#f97316', glow: 'rgba(249,115,22,0.3)'  },
  'Logic':     { gradient: 'linear-gradient(135deg, #003a1f, #001a0d)', accent: '#00cc6a', glow: 'rgba(0,204,106,0.3)'  },
  'Aptitude':  { gradient: 'linear-gradient(135deg, #3a2e00, #1a1500)', accent: '#eab308', glow: 'rgba(234,179,8,0.3)'  },
  'Mystery':   { gradient: 'linear-gradient(135deg, #4a0030, #1a0010)', accent: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
}

function CategoryCard({ category, solvedCount, onClick }) {
  const style = CATEGORY_STYLES[category.name] || CATEGORY_STYLES['Logic']
  const total = category.problem_count || 0
  const pct   = total > 0 ? Math.round((solvedCount / total) * 100) : 0

  return (
    <div
      onClick={onClick}
      style={{
        background: style.gradient,
        border: `1px solid ${style.accent}40`,
        borderRadius: '16px',
        padding: '1.75rem',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 12px 40px ${style.glow}`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: `${style.accent}15`,
      }} />

      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{category.icon}</div>
      <h3 style={{ margin: '0 0 0.25rem', color: '#fff', fontSize: '1.2rem' }}>{category.name}</h3>
      <p style={{ margin: '0 0 1.25rem', color: style.accent, fontSize: '0.8rem', opacity: 0.9 }}>
        {category.description || ''}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
          {solvedCount}/{total} solved
        </span>
        <span style={{ fontSize: '0.75rem', color: style.accent, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: style.accent, borderRadius: '20px',
          transition: 'width 0.6s ease',
        }} />
      </div>

      <div style={{
        marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        color: style.accent, fontSize: '0.85rem', fontWeight: 600,
      }}>
        Explore →
      </div>
    </div>
  )
}

function ProblemRow({ problem, solved }) {
  const navigate = useNavigate()
  const diff = DIFFICULTY_META[problem.difficulty] || DIFFICULTY_META.novice

  return (
    <div
      onClick={() => navigate(`/solve/${problem.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.25rem',
        background: solved ? 'rgba(0,204,106,0.06)' : 'var(--bg-card)',
        border: `1px solid ${solved ? 'rgba(0,204,106,0.3)' : 'var(--border)'}`,
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        marginBottom: '0.5rem',
      }}
      onMouseEnter={e => {
        if (!solved) e.currentTarget.style.borderColor = diff.color + '60'
      }}
      onMouseLeave={e => {
        if (!solved) e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Status dot */}
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
        background: solved ? '#00cc6a' : diff.color,
        boxShadow: `0 0 8px ${solved ? '#00cc6a' : diff.color}80`,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.15rem' }}>
          {problem.title}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {problem.body?.slice(0, 80)}...
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700,
          color: solved ? '#00cc6a' : diff.color,
          background: solved ? 'rgba(0,204,106,0.1)' : diff.bg,
          padding: '0.2rem 0.6rem', borderRadius: '20px',
        }}>
          {solved ? '✓ Solved' : `+${problem.token_reward} pts`}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</span>
      </div>
    </div>
  )
}

export default function Problems() {
  const [categories, setCategories]           = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [problems, setProblems]               = useState([])
  const [solvedIds, setSolvedIds]             = useState(new Set())
  const [categoryCounts, setCategoryCounts]   = useState({})
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const [cats, solutions] = await Promise.all([
          api.getCategories(),
          api.mySolutions(),
        ])
        setCategories(cats)
        const solved = new Set((solutions || []).filter(s => s.is_correct).map(s => s.problem_id))
        setSolvedIds(solved)

        // Build per-category solved counts from all problems
        const counts = {}
        cats.forEach(c => { counts[c.id] = { solved: 0, total: c.problem_count || 0 } })
        ;(solutions || []).filter(s => s.is_correct).forEach(s => {
          if (s.category_id && counts[s.category_id]) counts[s.category_id].solved++
        })
        setCategoryCounts(counts)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedCategory) return
    setLoading(true)
    api.getProblems({ category: selectedCategory.id, limit: 50 })
      .then(res => setProblems(res.items || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectedCategory])

  const problemsByDiff = DIFFICULTY_ORDER.reduce((acc, d) => {
    acc[d] = problems.filter(p => p.difficulty === d)
    return acc
  }, {})

  const catStyle = selectedCategory ? (CATEGORY_STYLES[selectedCategory.name] || CATEGORY_STYLES['Logic']) : null

  if (loading && !selectedCategory) {
    return <div className="loading">Loading categories...</div>
  }

  // ── Category grid view ──────────────────────────────────────
  if (!selectedCategory) {
    return (
      <div className="flex-col">
        {error && <div className="error">{error}</div>}

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.4rem' }}>Problem Categories</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Choose a category to explore problems by difficulty
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {categories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              solvedCount={categoryCounts[cat.id]?.solved || 0}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Drill-down: problems within category ────────────────────
  return (
    <div className="flex-col">
      {error && <div className="error">{error}</div>}

      {/* Header */}
      <div style={{
        background: catStyle.gradient,
        border: `1px solid ${catStyle.accent}40`,
        borderRadius: '14px',
        padding: '1.5rem 1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <button
          onClick={() => { setSelectedCategory(null); setProblems([]) }}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: '8px',
            color: '#fff', padding: '0.5rem 0.9rem',
            cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          ← Back
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.8rem' }}>{selectedCategory.icon}</span>
            <h2 style={{ margin: 0, color: '#fff' }}>{selectedCategory.name}</h2>
          </div>
          <p style={{ margin: '0.25rem 0 0', color: catStyle.accent, fontSize: '0.85rem' }}>
            {selectedCategory.description}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading problems...</div>
      ) : problems.length === 0 ? (
        <div className="text-center text-secondary" style={{ padding: '3rem' }}>
          No problems in this category yet.
        </div>
      ) : (
        <div className="flex-col" style={{ gap: '2.5rem' }}>
          {DIFFICULTY_ORDER.map(diff => {
            const group = problemsByDiff[diff]
            if (group.length === 0) return null
            const meta = DIFFICULTY_META[diff]
            const solvedInGroup = group.filter(p => solvedIds.has(p.id)).length
            return (
              <div key={diff}>
                {/* Difficulty header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '1rem', paddingBottom: '0.75rem',
                  borderBottom: `2px solid ${meta.color}30`,
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: meta.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800,
                    color: meta.color, border: `1px solid ${meta.color}40`,
                  }}>
                    {diff === 'novice' ? '①' : diff === 'apprentice' ? '②' : diff === 'expert' ? '③' : '④'}
                  </div>
                  <div>
                    <div style={{ color: meta.color, fontWeight: 700, fontSize: '1rem' }}>{meta.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{meta.desc}</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 700,
                    color: meta.color, background: meta.bg,
                    padding: '0.25rem 0.75rem', borderRadius: '20px',
                    border: `1px solid ${meta.color}30`,
                  }}>
                    {solvedInGroup}/{group.length} solved
                  </div>
                </div>

                {/* Problems */}
                <div>
                  {group.map(p => (
                    <ProblemRow key={p.id} problem={p} solved={solvedIds.has(p.id)} />
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
