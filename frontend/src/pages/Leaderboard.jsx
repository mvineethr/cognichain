import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const MEDALS = ['🥇', '🥈', '🥉']

const TABS = [
  { key: 'daily',    label: '⚡ Today',       col: 'Points' },
  { key: 'weekly',   label: '📅 This Week',   col: 'Points' },
  { key: 'alltime',  label: '🏆 All-Time',    col: 'Reputation' },
  { key: 'category', label: '🗂 By Category', col: 'Category Pts' },
]

export default function Leaderboard() {
  const [tab, setTab]               = useState('daily')
  const [leaderboard, setLeaderboard] = useState(null)
  const [categories, setCategories] = useState([])
  const [activeCat, setActiveCat]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // Load categories once
  useEffect(() => {
    api.getCategories()
      .then(cats => {
        setCategories(cats)
        if (cats.length > 0) setActiveCat(cats[0].id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 'category' && !activeCat) return
    fetchLeaderboard()
  }, [tab, activeCat])

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError('')
    try {
      let data
      switch (tab) {
        case 'daily':    data = await api.dailyLeaderboard(50);   break
        case 'weekly':   data = await api.weeklyLeaderboard(50);  break
        case 'alltime':  data = await api.alltimeLeaderboard(50); break
        case 'category': data = await api.categoryLeaderboard(activeCat, 50); break
      }
      setLeaderboard(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const colLabel = TABS.find(t => t.key === tab)?.col || 'Points'
  const entries  = leaderboard?.entries || []

  return (
    <div className="flex-col">
      {error && <div className="error">{error}</div>}

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem', marginBottom: '1.5rem',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.6rem 1.25rem',
              background: tab === t.key ? 'var(--accent)' : 'var(--bg-card)',
              color: tab === t.key ? 'var(--bg-dark)' : 'var(--text-secondary)',
              border: tab === t.key ? 'none' : '1px solid var(--border)',
              borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category selector */}
      {tab === 'category' && (
        <div style={{
          display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              style={{
                padding: '0.4rem 1rem',
                background: activeCat === cat.id ? 'rgba(110,231,168,0.15)' : 'var(--bg-darker)',
                color: activeCat === cat.id ? 'var(--accent)' : 'var(--text-secondary)',
                border: activeCat === cat.id ? '1px solid rgba(110,231,168,0.4)' : '1px solid var(--border)',
                borderRadius: '20px', fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏁</div>
          <h3>The leaderboard is wide open</h3>
          <p>Solve a problem now and claim the top spot.</p>
          <Link to="/daily" className="empty-state-cta">
            ⭐ Try today's challenge
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            background: 'var(--bg-card)', borderRadius: '10px', overflow: 'hidden',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-darker)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', width: '60px', fontWeight: 600 }}>Rank</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Player</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{colLabel}</th>
                {tab === 'daily' && (
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Time</th>
                )}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={entry.user_id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: idx < 3
                      ? `rgba(110,231,168,${0.06 - idx * 0.015})`
                      : idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-darker)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(110,231,168,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = idx < 3
                    ? `rgba(110,231,168,${0.06 - idx * 0.015})`
                    : idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-darker)'}
                >
                  <td style={{ padding: '1rem', fontWeight: 700, fontSize: '1.2rem' }}>
                    {idx < 3 ? MEDALS[idx] : <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>#{entry.rank}</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link
                      to={`/profile/${entry.username}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
                    >
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'var(--border)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        border: idx < 3 ? '2px solid rgba(110,231,168,0.5)' : 'none',
                      }}>
                        {entry.avatar_url
                          ? <img src={entry.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : '👤'}
                      </div>
                      <span style={{ fontWeight: idx < 3 ? 700 : 400, color: idx < 3 ? 'var(--text-primary)' : 'var(--accent)' }}>
                        {entry.username}
                      </span>
                    </Link>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontSize: '1.05rem' }}>
                    {entry.points.toLocaleString()}
                  </td>
                  {tab === 'daily' && (
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {entry.time_secs ? `${entry.time_secs}s` : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
