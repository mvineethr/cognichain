import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  GUEST_MAX_GUIDE_PER_PROB,
  recordGuestGuideMessage,
  getGuestGuideCount,
  guestGuideLimitReached,
  guestGuideRemaining,
} from '../lib/guest'

export default function GuideChat({ problemId, onInitialize, onFirstMessage }) {
  const { isGuest } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your Socratic guide. Ask me anything about this problem, and I\'ll help you think through it. Remember, I won\'t give you the answer—I\'ll help you discover it yourself! 💡' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [guideCount, setGuideCount] = useState(0)  // re-render when guest count changes
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (onInitialize) onInitialize(messages)
    // Sync guest counter on mount/problem change
    if (isGuest) setGuideCount(getGuestGuideCount(problemId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId])

  const limitReached = isGuest && guestGuideLimitReached(problemId)
  const remaining    = isGuest ? guestGuideRemaining(problemId) : null

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || limitReached) return

    const userMessage = input.trim()
    setInput('')
    setError('')

    const optimisticMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ]
    setMessages(optimisticMessages)

    try {
      setLoading(true)
      const payload = { problem_id: problemId, message: userMessage, history: messages }
      const response = isGuest
        ? await api.askGuideGuest(payload)
        : await api.askGuide(payload)

      setMessages([
        ...optimisticMessages,
        { role: 'assistant', content: response.reply }
      ])

      if (isGuest) {
        recordGuestGuideMessage(problemId)
        setGuideCount(getGuestGuideCount(problemId))
      }
      if (onFirstMessage) onFirstMessage()
    } catch (err) {
      setError(err.message)
      setMessages(optimisticMessages.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-darker)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>💡 Socratic Guide</h3>
          {isGuest && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem',
              borderRadius: '10px',
              background: limitReached ? 'rgba(255,107,107,0.15)' : 'rgba(110,231,168,0.12)',
              color: limitReached ? '#ff6b6b' : 'var(--accent)',
            }}>
              {limitReached ? 'Limit reached' : `${remaining} left`}
            </span>
          )}
        </div>
        <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0 0' }}>
          {isGuest
            ? `Guests get ${GUEST_MAX_GUIDE_PER_PROB} guide messages per problem`
            : "Think out loud, I'll ask questions"}
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-darker)',
                color: msg.role === 'user' ? 'var(--bg-dark)' : 'var(--text-primary)',
                wordWrap: 'break-word',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', background: 'var(--bg-darker)' }}>
              <span className="text-muted">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — or signup CTA when limit reached */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-darker)',
      }}>
        {error && <div className="error" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}

        {limitReached ? (
          <div style={{ textAlign: 'center', padding: '0.5rem' }}>
            <p className="text-sm" style={{ margin: '0 0 0.6rem', color: 'var(--text-secondary)' }}>
              You've used all {GUEST_MAX_GUIDE_PER_PROB} guide messages for this problem.
            </p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%' }}>✨ Sign up for unlimited guidance</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me a question..."
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? '...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
