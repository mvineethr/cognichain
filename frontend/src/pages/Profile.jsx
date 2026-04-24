import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const rankTitles = {
  'Novice':     { emoji: '🥚', color: 'var(--diff-novice)'     },
  'Apprentice': { emoji: '🌱', color: 'var(--diff-apprentice)' },
  'Adept':      { emoji: '🔥', color: 'var(--diff-expert)'     },
  'Master':     { emoji: '👑', color: 'var(--diff-master)'     },
  'Legend':     { emoji: '⭐', color: 'var(--diff-legend)'     },
}

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isOwnProfile = !username || username === user?.email?.split('@')[0]

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        let data
        if (isOwnProfile) {
          data = await api.getMyProfile()
        } else {
          data = await api.getProfile(username)
        }
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username, isOwnProfile])

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!profile) {
    return <div className="error">Profile not found</div>
  }

  const rankData = rankTitles[profile.rank_title] || rankTitles['Novice']

  return (
    <div className="flex-col">
      {/* Header */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex" style={{ gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--bg-darker)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            flexShrink: 0,
          }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              '👤'
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>@{profile.username}</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{
                fontSize: '1.5rem',
                background: `${rankData.color}20`,
                color: rankData.color,
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 600,
              }}>
                {rankData.emoji} {profile.rank_title}
              </span>
            </div>

            <div className="flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <p className="text-muted text-sm">Points</p>
                <p className="text-xl text-accent" style={{ margin: 0, fontWeight: 700 }}>
                  {profile.points}
                </p>
              </div>
              <div>
                <p className="text-muted text-sm">Current Streak</p>
                <p className="text-xl" style={{ margin: 0, fontWeight: 700 }}>
                  {profile.streak > 0 ? `🔥 ${profile.streak}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted text-sm">Longest Streak</p>
                <p className="text-xl" style={{ margin: 0, fontWeight: 700 }}>
                  {profile.longest_streak || 0}
                </p>
              </div>
              <div>
                <p className="text-muted text-sm">Reputation</p>
                <p className="text-xl" style={{ margin: 0, fontWeight: 700 }}>
                  {profile.reputation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>🏆 Badges ({profile.badges.length})</h2>
          <div className="grid grid-3">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-darker)',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
                title={badge.description}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {badge.icon}
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                  {badge.name}
                </p>
                {badge.awarded_at && (
                  <p className="text-xs text-muted" style={{ margin: '0.25rem 0 0 0' }}>
                    {new Date(badge.awarded_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Solutions (only for own profile) */}
      {isOwnProfile && profile.recent_solutions && profile.recent_solutions.length > 0 && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>📝 Recent Solutions</h2>
          <div className="flex-col">
            {profile.recent_solutions.map((sol) => (
              <div
                key={sol.id}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-darker)',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {sol.problems?.title || 'Problem'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="badge secondary" style={{ fontSize: '0.75rem' }}>
                      {sol.problems?.difficulty}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(sol.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {sol.is_correct ? (
                    <>
                      <p style={{ margin: 0, color: 'var(--success)', fontWeight: 600 }}>✓ Correct</p>
                      <p className="text-sm text-accent" style={{ margin: '0.25rem 0 0 0' }}>
                        +{sol.points_awarded} pts
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Attempted</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isOwnProfile && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <p>Viewing public profile. Detailed solution history is private.</p>
        </div>
      )}
    </div>
  )
}
