import { useEffect, useRef } from 'react'

/**
 * Google AdSense banner component.
 *
 * SETUP INSTRUCTIONS:
 * 1. Sign up at https://adsense.google.com
 * 2. Add your site and get approved
 * 3. Replace PUBLISHER_ID below with your ca-pub-XXXXXXXXXXXXXXXX ID
 * 4. Replace the slot IDs in Feed.jsx with your actual ad unit slot IDs
 * 5. Update the script src in index.html with your publisher ID too
 */

const PUBLISHER_ID = 'ca-pub-1056648710785121' // ← Replace with your AdSense publisher ID

export default function AdBanner({ slot, format = 'auto', style: extraStyle = {} }) {
  const insRef = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    // Only push once per mount to avoid duplicate ad errors
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      // AdSense not loaded yet (dev mode) — silently ignore
    }
  }, [])

  // Don't render in development if no real publisher ID set
  if (PUBLISHER_ID === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
      <div style={{
        background: 'repeating-linear-gradient(45deg, var(--bg-card), var(--bg-card) 10px, var(--bg-darker) 10px, var(--bg-darker) 20px)',
        border: '1px dashed var(--border)',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        ...extraStyle,
      }}>
        📢 Ad placeholder — configure AdSense publisher ID in AdBanner.jsx
      </div>
    )
  }

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block', ...extraStyle }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
