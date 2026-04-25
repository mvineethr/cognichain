import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import AdBanner from '../components/AdBanner'

const POST_TYPES = [
  { value: 'status', icon: '💬', label: 'Share something' },
  { value: 'help',   icon: '🤔', label: 'Ask for help' },
]

// Insert an ad every N posts
const AD_EVERY = 5
// Replace these slot IDs with your real AdSense ad unit slot IDs
const AD_SLOTS = ['8932186038']

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [hasMore, setHasMore]           = useState(true)
  const [error, setError]               = useState('')
  const [postType, setPostType]         = useState('status')
  const [content, setContent]           = useState('')
  const [posting, setPosting]           = useState(false)
  const [postError, setPostError]       = useState('')
  const offset = useRef(0)
  const LIMIT = 20

  const fetchPosts = async (reset = false) => {
    if (reset) {
      offset.current = 0
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    try {
      const data = await api.getFeed({ limit: LIMIT, offset: offset.current })
      if (reset) {
        setPosts(data)
      } else {
        setPosts(prev => [...prev, ...data])
      }
      offset.current += data.length
      setHasMore(data.length === LIMIT)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => { fetchPosts(true) }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    setPostError('')
    try {
      const newPost = await api.createPost({ type: postType, content: content.trim() })
      setPosts(prev => [newPost, ...prev])
      setContent('')
    } catch (err) {
      setPostError(err.message)
    } finally {
      setPosting(false)
    }
  }

  // Build feed items with ads interspersed
  const feedItems = []
  posts.forEach((post, idx) => {
    feedItems.push({ type: 'post', data: post, key: `post-${post.id}` })
    // Insert an ad after every AD_EVERY posts (but not after the last one)
    if ((idx + 1) % AD_EVERY === 0 && idx < posts.length - 1) {
      const slotIdx = Math.floor((idx + 1) / AD_EVERY - 1) % AD_SLOTS.length
      feedItems.push({ type: 'ad', slot: AD_SLOTS[slotIdx], key: `ad-${idx}` })
    }
  })

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {error && <div className="error">{error}</div>}

      {/* Compose Box */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 20px rgba(110,231,168,0.05)',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {POST_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setPostType(t.value)}
              style={{
                flex: 1, padding: '0.5rem',
                background: postType === t.value ? 'var(--accent)' : 'var(--bg-darker)',
                color: postType === t.value ? 'var(--bg-dark)' : 'var(--text-secondary)',
                border: postType === t.value ? 'none' : '1px solid var(--border)',
                borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handlePost}>
          {postError && <div className="error" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>{postError}</div>}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={
              postType === 'help'
                ? 'What problem are you stuck on? Describe your thinking so far...'
                : 'Share a win, insight, or something on your mind...'
            }
            disabled={posting}
            rows={3}
            style={{ width: '100%', resize: 'none', marginBottom: '0.75rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted text-sm">{content.length}/1000</span>
            <button
              type="submit"
              disabled={posting || !content.trim() || content.length > 1000}
              style={{ padding: '0.5rem 1.5rem' }}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="loading">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
          <h3>The feed is quiet right now</h3>
          <p style={{ marginBottom: '0.5rem' }}>
            Solve today's challenge — your solve will be the first thing here.
          </p>
          <Link to="/daily" className="empty-state-cta">
            ⭐ Try today's challenge
          </Link>
        </div>
      ) : (
        <div className="flex-col" style={{ gap: '1rem' }}>
          {feedItems.map(item =>
            item.type === 'post' ? (
              <PostCard
                key={item.key}
                post={item.data}
                currentUserId={user?.id}
              />
            ) : (
              <AdBanner
                key={item.key}
                slot={item.slot}
                style={{ minHeight: '90px', borderRadius: '8px' }}
              />
            )
          )}

          {hasMore && (
            <button
              onClick={() => fetchPosts(false)}
              disabled={loadingMore}
              className="secondary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
