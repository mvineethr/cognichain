import { useState } from 'react'

const FEEDBACK_EMAIL = 'vineethmudda@gmail.com'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const subject = encodeURIComponent('Puzzld feedback')
    const body    = encodeURIComponent(`${text}\n\n---\nFrom: ${window.location.href}`)
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
    try { window.plausible?.('Feedback Submitted') } catch {}
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setText('') }, 1500)
  }

  return (
    <>
      <button
        className="feedback-fab"
        onClick={() => setOpen(true)}
        title="Send feedback"
      >
        💬 Feedback
      </button>

      {open && (
        <div className="onboard-overlay" onClick={() => setOpen(false)}>
          <div className="onboard-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>💬 Send feedback</h3>
            <p className="text-sm text-muted" style={{ margin: '0 0 1rem' }}>
              Bug? Suggestion? Confused by something? Tell me — I read every message.
            </p>
            {sent ? (
              <p style={{ color: 'var(--accent)', textAlign: 'center', padding: '1rem' }}>
                ✅ Opening your email client...
              </p>
            ) : (
              <form onSubmit={submit}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                  autoFocus
                  style={{ width: '100%', resize: 'vertical', marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={!text.trim()}>
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
