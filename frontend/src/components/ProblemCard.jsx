import { Link } from 'react-router-dom'

const difficultyColors = {
  novice: '#4d9cff',
  apprentice: '#00cc6a',
  expert: '#ffb84d',
  master: '#ff6b6b',
}

const categoryIcons = {
  math: '📐',
  logic: '🧩',
  science: '🔬',
  social: '👥',
  hypothetical: '💭',
}

export default function ProblemCard({ problem, isDaily = false }) {
  const icon = categoryIcons[problem.category_name?.toLowerCase()] || problem.category_icon || '❓'
  const diffColor = difficultyColors[problem.difficulty] || '#b0b0b0'

  return (
    <Link to={`/solve/${problem.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', height: '100%' }}
           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div className="flex justify-between items-center">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{icon}</span>
              <h4 style={{ margin: 0 }}>{problem.title}</h4>
            </div>
            <p className="text-sm text-secondary" style={{ margin: 0 }}>
              {problem.category_name}
            </p>
          </div>
          {isDaily && <span className="badge primary" style={{ marginLeft: '1rem', whiteSpace: 'nowrap' }}>⭐ Daily</span>}
        </div>
        <div className="flex" style={{ marginTop: '1rem', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge secondary" style={{ backgroundColor: `${diffColor}20`, color: diffColor }}>
            {problem.difficulty}
          </span>
          <span className="text-sm text-accent" style={{ marginLeft: 'auto', fontWeight: 600 }}>
            +{problem.token_reward} pts
          </span>
        </div>
      </div>
    </Link>
  )
}
