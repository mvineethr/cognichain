import { Link } from 'react-router-dom'

const S = {
  page: {
    maxWidth: '780px', margin: '0 auto', padding: '2rem 1.5rem',
    color: 'var(--text-secondary)', lineHeight: 1.8,
  },
  h1: { color: 'var(--text-primary)', marginBottom: '0.25rem' },
  h2: { color: 'var(--accent)', fontSize: '1.1rem', marginTop: '2.5rem', marginBottom: '0.5rem' },
  updated: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' },
  table: {
    width: '100%', borderCollapse: 'collapse',
    background: 'var(--bg-card)', borderRadius: '8px',
    overflow: 'hidden', margin: '1rem 0',
  },
  th: {
    padding: '0.75rem 1rem', textAlign: 'left',
    background: 'var(--bg-darker)', color: 'var(--text-primary)',
    fontWeight: 600, fontSize: '0.85rem',
  },
  td: {
    padding: '0.75rem 1rem', borderTop: '1px solid var(--border)',
    color: 'var(--text-secondary)', fontSize: '0.9rem',
  },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem',
    marginBottom: '2rem',
  },
}

export default function Privacy() {
  return (
    <div style={S.page}>
      <Link to="/login" style={S.back}>← Back to sign in</Link>

      <h1 style={S.h1}>Privacy Policy</h1>
      <p style={S.updated}>Last updated: April 2026</p>

      <p>
        This Privacy Policy explains how <strong style={{ color: 'var(--text-primary)' }}>Puzzld</strong> ("we", "us")
        collects, uses, and protects your personal data when you use our platform.
        We are committed to transparency — especially regarding our use of data for AI development.
      </p>

      {/* ── Data Controller ── */}
      <h2 style={S.h2}>1. Who We Are</h2>
      <p>
        Puzzld is an independent platform. The data controller for your personal information
        is the Puzzld team. You can reach us at{' '}
        <strong style={{ color: 'var(--text-primary)' }}>vineethmudda@gmail.com</strong>.
      </p>

      {/* ── What We Collect ── */}
      <h2 style={S.h2}>2. Data We Collect</h2>

      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Category</th>
            <th style={S.th}>Data Collected</th>
            <th style={S.th}>Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><strong>Account</strong></td>
            <td style={S.td}>Username, email address, password (hashed)</td>
            <td style={S.td}>Authentication &amp; identity</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Activity</strong></td>
            <td style={S.td}>Problems solved, points, streaks, badges earned</td>
            <td style={S.td}>Gamification &amp; leaderboards</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Solutions</strong></td>
            <td style={S.td}>Your submitted answers, correctness, time taken</td>
            <td style={S.td}>Scoring + AI model training (anonymized)</td>
          </tr>
          <tr>
            <td style={S.td}><strong>AI Sessions</strong></td>
            <td style={S.td}>Your messages to the AI guide + AI responses</td>
            <td style={S.td}>Guide experience + AI model training (anonymized)</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Social</strong></td>
            <td style={S.td}>Posts, comments, likes you create</td>
            <td style={S.td}>Community feed</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Technical</strong></td>
            <td style={S.td}>Browser type, device type, IP address (via Supabase logs)</td>
            <td style={S.td}>Security &amp; abuse prevention</td>
          </tr>
        </tbody>
      </table>

      {/* ── AI Training ── */}
      <h2 style={S.h2}>3. Use of Data for AI Model Training</h2>
      <p>
        Puzzld's long-term mission includes developing open-source AI reasoning models
        trained on real human problem-solving data. To support this:
      </p>
      <ul>
        <li>Your AI guide conversations and problem solutions may be used as training data</li>
        <li>All training data is <strong>anonymized</strong> — your username, email, and user ID are stripped before any data is used for training or shared externally</li>
        <li>We may generate ideal reasoning traces from your sessions using automated methods</li>
        <li>Anonymized datasets will never be sold; they may be released publicly as open-source research assets</li>
      </ul>
      <p>
        By creating an account and using Puzzld, you explicitly consent to this data use
        as described in our <Link to="/tos" style={{ color: 'var(--accent)' }}>Terms of Service</Link>.
      </p>

      {/* ── How We Use Data ── */}
      <h2 style={S.h2}>4. How We Use Your Data</h2>
      <ul>
        <li>To provide and improve the Puzzld platform</li>
        <li>To calculate points, streaks, and leaderboard rankings</li>
        <li>To power the AI guide experience (via Anthropic's Claude API)</li>
        <li>To display relevant advertising (via Google AdSense) to free-tier users</li>
        <li>To train and fine-tune AI reasoning models (anonymized data only)</li>
        <li>To send account-related emails (security, major policy changes)</li>
      </ul>

      {/* ── Third Parties ── */}
      <h2 style={S.h2}>5. Third-Party Services</h2>
      <p>We use the following third-party services that may receive your data:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — Database, authentication, and storage. Your account data
          and activity is stored on Supabase servers. See{' '}
          <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            Supabase Privacy Policy
          </a>.
        </li>
        <li>
          <strong>Anthropic (Claude API)</strong> — Powers the AI guide. Your messages to the AI guide
          are sent to Anthropic for processing. See{' '}
          <a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            Anthropic Privacy Policy
          </a>.
        </li>
        <li>
          <strong>Google AdSense</strong> — Displays advertisements to free-tier users. Google may use
          cookies to serve personalized ads. See{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            Google Privacy Policy
          </a>.
        </li>
        <li>
          <strong>Railway &amp; Vercel</strong> — Infrastructure hosting. See their respective privacy policies.
        </li>
      </ul>
      <p>
        We do not sell your personal data to any third party.
      </p>

      {/* ── Cookies ── */}
      <h2 style={S.h2}>6. Cookies</h2>
      <p>
        Puzzld uses cookies and local storage to maintain your login session and remember
        preferences. Google AdSense may set its own cookies for advertising purposes.
        You can manage or disable cookies in your browser settings; however, some features may
        not work correctly without cookies enabled.
      </p>

      {/* ── Data Retention ── */}
      <h2 style={S.h2}>7. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active. If you request
        account deletion, we will remove your personal identifiers (username, email) within 30 days.
        Anonymized session and solution data may be retained indefinitely as part of research datasets.
      </p>

      {/* ── Your Rights ── */}
      <h2 style={S.h2}>8. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li><strong>Access</strong> the personal data we hold about you</li>
        <li><strong>Correct</strong> inaccurate personal data</li>
        <li><strong>Delete</strong> your account and personal data</li>
        <li><strong>Opt out</strong> of personalized advertising (via your Google account settings)</li>
        <li><strong>Object</strong> to processing for AI training purposes (contact us below)</li>
      </ul>
      <p>
        To exercise any of these rights, email{' '}
        <strong style={{ color: 'var(--text-primary)' }}>vineethmudda@gmail.com</strong>.
        We will respond within 30 days.
      </p>

      {/* ── Children ── */}
      <h2 style={S.h2}>9. Children's Privacy</h2>
      <p>
        Puzzld is not directed at children under 13. We do not knowingly collect personal
        data from children under 13. If you believe a child under 13 has created an account,
        please contact us and we will delete the account promptly.
      </p>

      {/* ── Changes ── */}
      <h2 style={S.h2}>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. We will notify registered users of
        material changes via email. Continued use of Puzzld after changes are posted
        constitutes acceptance of the revised policy.
      </p>

      {/* ── Contact ── */}
      <h2 style={S.h2}>11. Contact Us</h2>
      <p>
        Questions or concerns about this Privacy Policy?{' '}
        Email us at <strong style={{ color: 'var(--text-primary)' }}>vineethmudda@gmail.com</strong>.
      </p>

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/tos" style={{ color: 'var(--accent)' }}>Terms of Service</Link>
        <Link to="/login" style={{ color: 'var(--text-muted)' }}>Back to sign in</Link>
      </div>
    </div>
  )
}
