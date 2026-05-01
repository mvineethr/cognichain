import { Link } from 'react-router-dom'

const S = {
  page: {
    maxWidth: '780px', margin: '0 auto', padding: '2rem 1.5rem',
    color: 'var(--text-secondary)', lineHeight: 1.8,
  },
  h1: { color: 'var(--text-primary)', marginBottom: '0.25rem' },
  h2: { color: 'var(--accent)', fontSize: '1.1rem', marginTop: '2.5rem', marginBottom: '0.5rem' },
  updated: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' },
  highlight: {
    background: 'rgba(110,231,168,0.08)', border: '1px solid rgba(110,231,168,0.25)',
    borderRadius: '8px', padding: '1rem 1.25rem', margin: '1.25rem 0',
    color: 'var(--text-primary)', fontSize: '0.95rem',
  },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem',
    marginBottom: '2rem',
  },
}

export default function ToS() {
  return (
    <div style={S.page}>
      <Link to="/login" style={S.back}>← Back to sign in</Link>

      <h1 style={S.h1}>Terms of Service</h1>
      <p style={S.updated}>Last updated: April 2026</p>

      <p>
        Welcome to <strong style={{ color: 'var(--text-primary)' }}>Puzzld</strong> ("we", "us", or "the Platform").
        By creating an account or using our services, you agree to these Terms of Service.
        Please read them carefully before registering.
      </p>

      {/* ── Eligibility ── */}
      <h2 style={S.h2}>1. Eligibility</h2>
      <p>
        You must be at least <strong>13 years old</strong> to use Puzzld. By creating an account,
        you represent that you meet this age requirement and that all information you provide is accurate.
      </p>

      {/* ── What the Platform Does ── */}
      <h2 style={S.h2}>2. What Puzzld Is</h2>
      <p>
        Puzzld is a problem-solving platform where users solve math, science, logic,
        puzzle, and aptitude challenges guided by a Socratic AI tutor. Users earn points,
        maintain streaks, and share progress on a social feed.
      </p>

      {/* ── Data Collection — KEY DISCLOSURE ── */}
      <h2 style={S.h2}>3. Data Collection &amp; AI Training — Important Disclosure</h2>

      <div style={S.highlight}>
        <strong>⚠️ AI Training Disclosure</strong><br />
        By using Puzzld, you consent to your problem-solving sessions — including your
        submitted answers, AI guide conversations, and interaction patterns — being collected
        and used to train and improve AI reasoning models. This data will be anonymized
        before use and will never be linked to your personal identity in any published dataset.
      </div>

      <p>We collect and may use the following data:</p>
      <ul>
        <li><strong>Account data:</strong> username, email address (not shared publicly)</li>
        <li><strong>Activity data:</strong> problems solved, points earned, streaks, badges</li>
        <li><strong>Session data:</strong> your messages to the AI guide and the AI's responses</li>
        <li><strong>Solution data:</strong> your submitted answers, correctness, and time taken</li>
        <li><strong>Social data:</strong> posts, comments, and likes on the public feed</li>
      </ul>
      <p>
        Session and solution data may be used to fine-tune open-source AI reasoning models.
        All training data is anonymized — your username and email are never included.
        You may request deletion of your data at any time (see Section 8).
      </p>

      {/* ── User Content ── */}
      <h2 style={S.h2}>4. User Content</h2>
      <p>
        You retain ownership of any content you create (posts, comments). By posting,
        you grant Puzzld a non-exclusive, royalty-free license to display and distribute
        that content within the Platform. You are responsible for ensuring your content does
        not violate others' rights or applicable laws.
      </p>

      {/* ── Acceptable Use ── */}
      <h2 style={S.h2}>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Create multiple accounts to game points or leaderboards</li>
        <li>Use automated tools or bots to interact with the Platform</li>
        <li>Post harmful, abusive, or illegal content</li>
        <li>Attempt to reverse-engineer or exploit the AI guide system</li>
        <li>Scrape or harvest data from the Platform without permission</li>
      </ul>
      <p>
        Violations may result in account suspension or permanent termination without prior notice.
      </p>

      {/* ── AI Guide ── */}
      <h2 style={S.h2}>6. AI Guide Limitations</h2>
      <p>
        The AI guide is designed to assist learning through a Socratic method — it asks questions
        rather than giving direct answers. It is not infallible. Do not rely on it for
        critical decisions. AI responses are for educational purposes only.
      </p>

      {/* ── Advertising ── */}
      <h2 style={S.h2}>7. Advertising</h2>
      <p>
        Puzzld displays third-party advertisements (via Google AdSense) to free-tier users.
        We do not control the content of these ads. Ad networks may use cookies to serve
        relevant advertisements. See our <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link> for details.
      </p>

      {/* ── Data Deletion ── */}
      <h2 style={S.h2}>8. Account &amp; Data Deletion</h2>
      <p>
        You may request deletion of your account and associated personal data at any time by
        emailing us at <strong style={{ color: 'var(--text-primary)' }}>vineethmudda@gmail.com</strong>.
        Anonymized data already incorporated into AI training datasets cannot be retroactively removed,
        as it is no longer linked to your identity.
      </p>

      {/* ── Disclaimers ── */}
      <h2 style={S.h2}>9. Disclaimers &amp; Limitation of Liability</h2>
      <p>
        Puzzld is provided "as is" without warranties of any kind. We do not guarantee
        uninterrupted access, accuracy of AI responses, or preservation of user data.
        To the fullest extent permitted by law, Puzzld is not liable for indirect,
        incidental, or consequential damages arising from your use of the Platform.
      </p>

      {/* ── Changes ── */}
      <h2 style={S.h2}>10. Changes to These Terms</h2>
      <p>
        We may update these Terms periodically. Continued use of Puzzld after changes
        are posted constitutes acceptance of the revised Terms. We will notify registered
        users of material changes via email where possible.
      </p>

      {/* ── Contact ── */}
      <h2 style={S.h2}>11. Contact</h2>
      <p>
        Questions about these Terms? Email us at{' '}
        <strong style={{ color: 'var(--text-primary)' }}>vineethmudda@gmail.com</strong>.
      </p>

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link>
        <Link to="/login" style={{ color: 'var(--text-muted)' }}>Back to sign in</Link>
      </div>
    </div>
  )
}
