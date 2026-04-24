import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import PointsBadge from './PointsBadge'

const NAV_LINKS = [
  { to: '/',            label: 'Feed',        icon: '🏠' },
  { to: '/daily',       label: 'Daily',       icon: '⭐' },
  { to: '/problems',    label: 'Problems',    icon: '🧩' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'me'

  return (
    <div className="app-shell">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="sidebar">

        {/* Logo */}
        <NavLink to="/" className="sidebar-logo">
          ⚡ CogniChain
        </NavLink>

        {/* Nav links */}
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}

        <div className="nav-divider" />

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          <span>Profile</span>
        </NavLink>

        {/* Bottom section — points + user card */}
        <div className="sidebar-bottom">

          {/* Points + streak line */}
          <div className="sidebar-points">
            <div className="dot" />
            <PointsBadge compact />
          </div>

          {/* User card */}
          <div className="user-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="user-card-avatar">
                {user?.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt={username} />
                  : '👤'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: '0.87rem',
                  color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  @{username}
                </div>
                <RankBadge userId={user?.id} />
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="secondary"
              style={{
                width: '100%', padding: '7px', fontSize: '0.78rem',
                borderColor: 'var(--border)', color: 'var(--text-muted)',
                borderRadius: 8,
              }}
            >
              Sign out
            </button>
          </div>

        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="main-area">
        <div className="page-content">
          <Outlet />
        </div>
      </main>

    </div>
  )
}

/**
 * Small rank badge — reads from profile context or renders nothing.
 * Replace with your actual profile hook if you have one.
 */
function RankBadge({ userId }) {
  const [rank, setRank] = useState(null)

  useEffect(() => {
    // Pulls rank from localStorage cache set by PointsBadge/Profile pages
    const cached = localStorage.getItem('cognichain_rank')
    if (cached) setRank(cached)
  }, [userId])

  if (!rank) return null

  const RANK_COLORS = {
    Novice:     '#a8c8ff',
    Apprentice: '#6ee7a8',
    Adept:      '#ffd6a5',
    Master:     '#ffadad',
    Legend:     '#ffd66e',
  }
  const color = RANK_COLORS[rank] || '#9aabbf'

  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 600,
      padding: '1px 7px', borderRadius: 10,
      background: `${color}18`, color,
      display: 'inline-block', marginTop: 2,
    }}>
      🌱 {rank}
    </span>
  )
}
