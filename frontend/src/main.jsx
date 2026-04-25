import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './context/AuthContext'

import Feed        from './pages/Feed'
import Daily       from './pages/Daily'
import Problems    from './pages/Problems'
import Solve       from './pages/Solve'
import Profile     from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Login       from './pages/Login'
import ToS         from './pages/ToS'
import Privacy     from './pages/Privacy'
import Layout      from './components/Layout'

import './index.css'

/**
 * Allows real users OR guests through. Pages decide what to gate
 * for guests (Feed/Leaderboard/Profile redirect; Solve/Daily/Problems work).
 */
function PrivateRoute({ children }) {
  const { user, isGuest, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  return (user || isGuest) ? children : <Navigate to="/login" replace />
}

/**
 * For pages that real users see but guests should be redirected away from
 * (Feed, Leaderboard, Profile). Wraps a PrivateRoute child.
 */
function MembersOnly({ children }) {
  const { user, isGuest } = useAuth()
  if (isGuest && !user) return <Navigate to="/daily" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — no auth required */}
          <Route path="/login"   element={<Login />} />
          <Route path="/tos"     element={<ToS />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected routes */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index                    element={<MembersOnly><Feed /></MembersOnly>} />
            <Route path="daily"             element={<Daily />} />
            <Route path="problems"          element={<Problems />} />
            <Route path="solve/:id"         element={<Solve />} />
            <Route path="profile"           element={<MembersOnly><Profile /></MembersOnly>} />
            <Route path="profile/:username" element={<MembersOnly><Profile /></MembersOnly>} />
            <Route path="leaderboard"       element={<MembersOnly><Leaderboard /></MembersOnly>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
