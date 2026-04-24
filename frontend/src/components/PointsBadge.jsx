import { useEffect, useState } from 'react'
import { api } from '../lib/api'

/**
 * PointsBadge — shows points + streak in the sidebar bottom rail.
 *
 * Props:
 *   compact (bool) — if true, renders inline for the sidebar points row.
 *                    If false (default), renders the full pill badge.
 */
export default function PointsBadge({ compact = false }) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    api.getMyProfile()
      .then(data => {
        setProfile(data)
        // Cache rank for Layout's RankBadge
        if (data?.rank_title) {
          localStorage.setItem('cognichain_rank', data.rank_title)
        }
      })
      .catch(() => {})
  }, [])

  if (!profile) return null

  if (compact) {
    // Sidebar inline row variant
    return (
      <>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.78rem', fontWeight: 700,
          color: 'var(--accent)',
        }}>
          {profile.points.toLocaleString()} pts
        </span>
        {profile.streak > 0 && (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.78rem',
            color: 'var(--warning)',
            marginLeft: 4,
          }}>
            🔥 {profile.streak}
          </span>
        )}
      </>
    )
  }

  // Full pill badge (kept for any other use)
  return (
    <div className="badge primary" style={{
      display: 'flex', gap: '0.5rem', alignItems: 'center',
      fontFamily: "'Space Mono', monospace",
    }}>
      <span>{profile.points.toLocaleString()} pts</span>
      {profile.streak > 0 && (
        <span style={{ color: 'var(--warning)' }} title={`${profile.streak}-day streak`}>
          🔥 {profile.streak}
        </span>
      )}
    </div>
  )
}
