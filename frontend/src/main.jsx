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
import Layout      from './components/Layout'

import './index.css'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index                    element={<Feed />} />
            <Route path="daily"             element={<Daily />} />
            <Route path="problems"          element={<Problems />} />
            <Route path="solve/:id"         element={<Solve />} />
            <Route path="profile"           element={<Profile />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="leaderboard"       element={<Leaderboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
