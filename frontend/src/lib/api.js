import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(method, path, body) {
  const headers  = await authHeaders()
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || 'Request failed')
  }
  return response.json()
}

export const api = {
  // ── Problems ──────────────────────────────────────────────
  getDailyProblem: ()           => request('GET', '/problems/daily'),
  getDailySet:     ()           => request('GET', '/problems/daily-set'),
  getCategories:   ()           => request('GET', '/problems/categories'),
  getProblems: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request('GET', `/problems${q ? '?' + q : ''}`)
  },
  getProblem: (id) => request('GET', `/problems/${id}`),

  // ── Solutions ─────────────────────────────────────────────
  submitSolution: (body) => request('POST', '/solutions', body),
  mySolutions:    ()     => request('GET',  '/solutions/me'),

  // ── AI Guide ──────────────────────────────────────────────
  askGuide: (body) => request('POST', '/guide', body),

  // ── Users ─────────────────────────────────────────────────
  getMyProfile: ()           => request('GET', '/users/me'),
  getProfile:   (username)   => request('GET', `/users/${username}`),

  // ── Leaderboard ───────────────────────────────────────────
  dailyLeaderboard:   (limit = 20) => request('GET', `/leaderboard/daily?limit=${limit}`),
  weeklyLeaderboard:  (limit = 20) => request('GET', `/leaderboard/weekly?limit=${limit}`),
  alltimeLeaderboard:    (limit = 20)              => request('GET', `/leaderboard/alltime?limit=${limit}`),
  categoryLeaderboard:   (categoryId, limit = 20)  => request('GET', `/leaderboard/category?category_id=${categoryId}&limit=${limit}`),

  // ── Feed ──────────────────────────────────────────────────
  getFeed:        (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request('GET', `/feed${q ? '?' + q : ''}`)
  },
  createPost:      (body)   => request('POST', '/feed', body),
  likePost:        (id)     => request('POST', `/feed/${id}/like`),
  getComments:     (id)     => request('GET',  `/feed/${id}/comments`),
  addComment:      (id, body) => request('POST', `/feed/${id}/comments`, body),
}
