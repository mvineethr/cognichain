import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function PointsBadge() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getMyProfile()
        setProfile(data)
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return <div className="text-sm text-muted">Loading...</div>
  if (!profile) return null

  return (
    <div className="badge primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span>{profile.points} pts</span>
      {profile.streak > 0 && (
        <span title={`${profile.streak}-day streak`}>🔥 {profile.streak}</span>
      )}
    </div>
  )
}
