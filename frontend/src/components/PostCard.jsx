import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const TYPE_CONFIG = {
  solve:       { color: '#00cc6a', icon: '✅', label: 'Solved' },
  achievement: { color: '#ffd700', icon: '🏆', label: 'Achievement' },
  status:      { color: '#4d9cff', icon: '💬', label: 'Post' },
  help:        { color: '#ff9f43', icon: '🤔', label: 'Help' },
}

const RANK_COLORS = {
  Novice:     '#4d9cff',
  Apprentice: '#00cc6a',
  Expert:     '#ffb84d',
  Master:     '#ff6b6b',
  Legend:     '#ffd700',
}

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60)    return 'just now'
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function PostCard({ post, currentUserId }) {
  const [liked, setLiked]           = useState(post.liked)
  const [likeCount, setLikeCount]   = useState(post.like_count)
  const [likeAnim, setLikeAnim]     = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]     = useState(null)
  const [commentInput, setCommentInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.status
  const rankColor = RANK_COLORS[post.rank_title] || '#b0b0b0'
  const meta = post.metadata || {}

  const handleLike = async () => {
    setLiked(l => !l)
    setLikeCount(c => liked ? c - 1 : c + 1)
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 300)
    try {
      await api.likePost(post.id)
    } catch {
      setLiked(l => !l)
      setLikeCount(c => liked ? c + 1 : c - 1)
    }
  }

  const handleToggleComments = async () => {
    if (!showComments && comments === null) {
      try {
        const data = await api.getComments(post.id)
        setComments(data)
      } catch {
        setComments([])
      }
    }
    setShowComments(v => !v)
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    setSubmitting(true)
    try {
      const c = await api.addComment(post.id, { content: commentInput })
      setComments(prev => [...(prev || []), c])
      setCommentInput('')
    } catch { }
    finally { setSubmitting(false) }
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${cfg.color}15`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Avatar */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
          background: `${cfg.color}25`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.1rem', border: `1px solid ${cfg.color}40`,
        }}>
          {post.avatar_url
            ? <img src={post.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : '👤'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to={`/profile/${post.username}`} style={{
              fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none',
            }}>
              @{post.username}
            </Link>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem',
              borderRadius: '10px', background: `${rankColor}20`, color: rankColor,
            }}>
              {post.rank_title}
            </span>
            <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>
              {timeAgo(post.created_at)}
            </span>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <span style={{
              fontSize: '0.75rem', color: cfg.color, fontWeight: 600,
              background: `${cfg.color}15`, padding: '0.1rem 0.5rem', borderRadius: '8px',
            }}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 1.25rem 0.75rem' }}>
        <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-primary)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>@{post.username}</span>{' '}
          {post.content}
        </p>

        {/* Problem reference */}
        {post.problem_id && meta.problem_title && (
          <Link to={`/solve/${post.problem_id}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            marginTop: '0.75rem', padding: '0.4rem 0.75rem',
            background: 'var(--bg-darker)', border: '1px solid var(--border)',
            borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent)',
            textDecoration: 'none', transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            🔗 {meta.problem_title}
            {meta.difficulty && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>· {meta.difficulty}</span>
            )}
          </Link>
        )}

        {/* Achievement badge name */}
        {post.type === 'achievement' && meta.badge_name && (
          <div style={{
            marginTop: '0.75rem', padding: '0.6rem 1rem',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05))',
            border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
            <span style={{ color: '#ffd700', fontWeight: 600 }}>{meta.badge_name}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.6rem 1.25rem',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '1rem', alignItems: 'center',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <button
          onClick={handleLike}
          style={{
            background: 'none', border: 'none', padding: '0.3rem 0.6rem',
            borderRadius: '6px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem',
            color: liked ? cfg.color : 'var(--text-muted)',
            transform: likeAnim ? 'scale(1.3)' : 'scale(1)',
            transition: 'color 0.2s, transform 0.2s',
          }}
        >
          {liked ? '♥' : '♡'} {likeCount > 0 && likeCount}
        </button>

        <button
          onClick={handleToggleComments}
          style={{
            background: 'none', border: 'none', padding: '0.3rem 0.6rem',
            borderRadius: '6px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem',
            color: showComments ? 'var(--text-primary)' : 'var(--text-muted)',
            transition: 'color 0.2s',
          }}
        >
          💬 {post.comment_count > 0 && post.comment_count}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem' }}>
          {comments === null ? (
            <p className="text-muted text-sm">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-muted text-sm">No comments yet. Be the first!</p>
          ) : (
            <div className="flex-col" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--bg-darker)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                  }}>
                    {c.avatar_url ? <img src={c.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'baseline' }}>
                      <Link to={`/profile/${c.username}`} style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none' }}>
                        @{c.username}
                      </Link>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{timeAgo(c.created_at)}</span>
                    </div>
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              disabled={submitting}
              style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
            />
            <button type="submit" disabled={submitting || !commentInput.trim()} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              {submitting ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
