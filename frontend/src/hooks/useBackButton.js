import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Handles the Android hardware back button via Capacitor's App plugin.
 * - If there's history to go back through, navigate(-1).
 * - If we're at the root, exit the app.
 * No-ops silently on web (Capacitor.isNativePlatform() = false).
 */
export function useBackButton() {
  const navigate = useNavigate()

  useEffect(() => {
    let handle = null

    async function register() {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return

        const { App } = await import('@capacitor/app')
        handle = await App.addListener('backButton', ({ canGoBack }) => {
          if (window.history.length > 1) {
            navigate(-1)
          } else {
            App.exitApp()
          }
        })
      } catch {
        // Not running in Capacitor — ignore
      }
    }

    register()
    return () => { handle?.remove() }
  }, [navigate])
}
