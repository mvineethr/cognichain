import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import GuideChat from '../components/GuideChat'

export default function Solve() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem] = useState(null)
  const [solution, setSolution] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [chatHistory, setChatHistory] = useState([])

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await api.getProblem(id)
        setProblem(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProblem()
  }, [id])

  const handleSubmitSolution = async (e) => {
    e.preventDefault()
    if (!solution.trim()) {
      setError('Please enter a solution')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await api.submitSolution({
        problem_id: id,
        content: solution,
        time_taken_secs: null,
      })

      setResult(response)
      setSolution('')

      if (response.is_correct) {
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading problem...</div>
  }

  if (!problem) {
    return <div className="error">Problem not found</div>
  }

  const categoryEmojis = {
    'math': '📐',
    'logic': '🧩',
    'science': '🔬',
    'social': '👥',
    'hypothetical': '💭',
  }

  const emoji = categoryEmojis[problem.category_name?.toLowerCase()] || problem.category_icon || '❓'

  return (
    <div className="solve-grid">
      {/* Problem Panel */}
      <div className="flex-col" style={{ overflow: 'auto' }}>
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>{emoji}</span>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>{problem.title}</h2>
              <div className="flex gap-1">
                <span className="badge secondary">{problem.category_name}</span>
                <span className="badge secondary">{problem.difficulty}</span>
                <span className="badge primary" style={{ marginLeft: 'auto' }}>+{problem.token_reward}</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-darker)',
            padding: '1rem',
            borderRadius: '6px',
            margin: '1rem 0',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
          }}>
            {problem.body}
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            <p className="text-sm text-muted">
              <strong>Answer type:</strong> {problem.answer_type === 'exact' ? 'Exact match' : problem.answer_type === 'numeric' ? 'Numeric' : 'Peer reviewed'}
            </p>
            <p className="text-sm text-muted">
              <strong>Solved by:</strong> {problem.solve_count} users
            </p>
          </div>
        </div>

        {/* Submit Solution */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Submit Your Solution</h3>
          {error && <div className="error">{error}</div>}
          {result && (
            <div className={result.is_correct ? 'success' : 'warning'}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'inherit' }}>
                {result.is_correct ? '✓ Correct!' : '⟲ Not quite yet'}
              </h4>
              <p style={{ margin: 0 }}>{result.message}</p>
              {result.badges_earned && result.badges_earned.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Badges earned:</strong> {result.badges_earned.join(', ')}
                </div>
              )}
              {result.is_correct && (
                <p className="text-sm" style={{ marginTop: '0.5rem', opacity: 0.8 }}>
                  Redirecting to feed...
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmitSolution} className="flex-col">
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter your solution..."
              disabled={submitting}
              style={{ minHeight: '120px' }}
            />
            <button type="submit" disabled={submitting} style={{ alignSelf: 'flex-end' }}>
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </button>
          </form>
        </div>
      </div>

      {/* Guide Panel */}
      <div style={{ overflow: 'hidden' }}>
        <GuideChat
          problemId={id}
          onInitialize={(history) => setChatHistory(history)}
        />
      </div>
    </div>
  )
}
