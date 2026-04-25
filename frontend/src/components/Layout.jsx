import { Outlet, NavLink, useNavigate, useMatch, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import PointsBadge from './PointsBadge'
import OnboardingModal from './OnboardingModal'
import FeedbackButton from './FeedbackButton'
import {
  GUEST_MAX_SOLVES,
  getGuestSolveCount,
  guestSolvesRemaining,
} from '../lib/guest'

const NAV_LINKS_USER = [
  { to: '/',            label: 'Feed',        icon: '🏠' },
  { to: '/daily',       label: 'Daily',       icon: '⭐' },
  { to: '/problems',    label: 'Problems',    icon: '🧩' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
]

const NAV_LINKS_GUEST = [
  { to: '/daily',       label: 'Daily',       icon: '⭐' },
  { to: '/problems',    label: 'Problems',    icon: '🧩' },
]

export default function Layout() {
  const { user, isGuest, signOut, endGuest } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleExitGuest = () => {
    endGuest()
    navigate('/login')
  }

  const username  = user?.user_metadata?.username || user?.email?.split('@')[0] || 'me'
  const isSolving = useMatch('/solve/:id')
  const navLinks  = isGuest ? NAV_LINKS_GUEST : NAV_LINKS_USER

  return (
    <div className="app-shell">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="sidebar">

        {/* Logo */}
        <NavLink to={isGuest ? '/daily' : '/'} className="sidebar-logo">
          ⚡ CogniChain
        </NavLink>

        {/* Nav links */}
        {navLinks.map(link => (
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

        {/* Disabled nav items for guests — hint at locked features */}
        {isGuest && (
          <>
            <NavLink
              to="/login"
              className="nav-item nav-item-locked"
              title="Sign up to unlock"
            >
              <span className="nav-icon">🏆</span>
              <span>Leaderboard</span>
              <span className="nav-lock">🔒</span>
            </NavLink>
            <NavLink
              to="/login"
              className="nav-item nav-item-locked"
              title="Sign up to unlock"
            >
              <span className="nav-icon">🏠</span>
              <span>Feed</span>
              <span className="nav-lock">🔒</span>
            </NavLink>
          </>
        )}

        <div className="nav-divider" />

        {!isGuest && (
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </NavLink>
        )}

        {/* Bottom section */}
        <div className="sidebar-bottom">

          {isGuest ? (
            // ── Guest sign-up CTA card ──
            <div className="guest-card">
              <div className="guest-card-eyebrow">👀 Guest mode</div>
              <div className="guest-card-meta">
                {guestSolvesRemaining()} of {GUEST_MAX_SOLVES} solves left
              </div>
              <div className="guest-card-bar">
                <div
                  className="guest-card-bar-fill"
                  style={{ width: `${(getGuestSolveCount() / GUEST_MAX_SOLVES) * 100}%` }}
                />
              </div>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', marginTop: '0.6rem', fontSize: '0.82rem' }}>
                  ✨ Sign up free
                </button>
              </Link>
              <button
                onClick={handleExitGuest}
                className="secondary"
                style={{
                  width: '100%', padding: '6px', fontSize: '0.74rem',
                  marginTop: '6px', borderColor: 'var(--border)',
                  color: 'var(--text-muted)', borderRadius: 8,
                }}
              >
                Exit guest mode
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}

        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="main-area">
        <div className={`page-content${isSolving ? ' full-width' : ''}`}>
          <Outlet />
        </div>
      </main>

      {/* First-time onboarding (only for real users — guests already saw login) */}
      {!isGuest && <OnboardingModal />}

      {/* Floating feedback button */}
      {!isSolving && <FeedbackButton />}

    </div>
  )
}

/**
 * Small rank badge — reads from profile context or renders nothing.
 */
function RankBadge({ userId }) {
  const [rank, setRank] = useState(null)

  useEffect(() => {
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
