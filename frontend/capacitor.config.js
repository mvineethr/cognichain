/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId:  'io.puzzld.app',
  appName: 'Puzzld',
  webDir: 'dist',

  server: {
    // Use https scheme on Android so cookies and secure contexts work correctly
    androidScheme: 'https',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration:  2000,
      backgroundColor:     '#080c14',   // matches --bg-darkest
      showSpinner:         false,
      splashFullScreen:    true,
      splashImmersive:     true,
    },
    StatusBar: {
      style:               'Dark',      // light icons on dark bg
      backgroundColor:     '#080c14',
      overlaysWebView:     false,
    },
  },
}

export default config
