import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'me'

  return (
    <div>
      <nav style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 1rem',
          display: 'flex', alignItems: 'center', gap: '1rem', height: '60px',
        }}>
          {/* Logo */}
          <NavLink to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
              ⚡ CogniChain
            </span>
          </NavLink>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '0.25rem', flex: 1, justifyContent: 'center' }}>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.9rem', borderRadius: '8px',
                  textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
                  transition: 'all 0.15s',
                  background: isActive ? 'rgba(0,204,106,0.15)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                })}
              >
                <span style={{ fontSize: '1rem' }}>{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <PointsBadge />
            <NavLink
              to="/profile"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                background: isActive ? 'rgba(0,204,106,0.15)' : 'var(--bg-darker)',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                transition: 'all 0.15s',
              })}
            >
              👤 {username}
            </NavLink>
            <button
              onClick={handleSignOut}
              className="secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            >
              Out
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
