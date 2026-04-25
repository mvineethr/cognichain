import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isGuestMode, enterGuestMode, exitGuestMode } from '../lib/guest'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      // Guest flag only matters when no real user is signed in
      setIsGuest(u ? false : isGuestMode())
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        // Real user signed in — clear guest mode
        exitGuestMode()
        setIsGuest(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    exitGuestMode()
    setIsGuest(false)
  }

  const startGuest = () => {
    enterGuestMode()
    setIsGuest(true)
  }

  const endGuest = () => {
    exitGuestMode()
    setIsGuest(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, signOut, startGuest, endGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
