// Cookie Consent Configuration
export const COOKIE_CONSENT_CONFIG = {
  version: '1.0.0',
  storageKey: 'cookie_consent',
  mode: 'gdpr',
  debug: false, // Debug mode for logging

  categories: {
    necessary: {
      id: 'necessary',
      label: 'Necesare',
      description: 'Aceste cookie-uri sunt esențiale pentru funcționarea site-ului și nu pot fi dezactivate.',
      required: true,
      enabled: true,
      locked: true
    },
    analytics: {
      id: 'analytics',
      label: 'Statistice',
      description: 'Ne ajută să înțelegem cum utilizezi site-ul pentru a-l îmbunătăți.',
      required: false,
      enabled: true,
      locked: false
    },
    marketing: {
      id: 'marketing',
      label: 'Marketing',
      description: 'Utilizate pentru a-ți afișa reclame relevante.',
      required: false,
      enabled: true,
      locked: false
    },
    preferences: {
      id: 'preferences',
      label: 'Preferinţe',
      description: 'Permit salvarea preferințelor tale de navigare.',
      required: false,
      enabled: true,
      locked: false
    }
  },

  // Display configuration
  display: {
    position: 'top-right',   // Position: 'bottom-center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    animation: 'slide',      // Animation: 'slide' | 'fade' | 'scale'
    delay: 1000,             // Delay before showing (ms)
    autoHide: 0,             // Auto-hide after (ms, 0 = disabled)
    showCloseButton: false,  // Show close button
    maxWidth: 900,           // Max width (px)
    zIndex: 9999             // Z-index
  },

  // Policy links
  policies: {
    privacy: '/privacy-policy',
    cookies: '/cookie-policy'
  },

  // Text content
  texts: {
    essential: {
      title: 'Cookies Essential',
      message: 'Acest site folosește cookie-uri esențiale pentru a asigura funcționarea corectă.',
      button: 'Accept'
    },
    gdpr: {
      title: 'Cookie',
      message: 'Acest site folosește cookie-uri pentru a-ți asigura cea mai bună experiență. Poți alege categoriile pe care dorești să le activezi.',
      buttons: {
        acceptAll: 'Acceptă toate',
        rejectAll: 'Respinge toate',
        acceptSelection: 'Acceptă selecţia',
        settings: 'Setări cookie'
      }
    },
    settings: {
      title: 'Setări cookie',
      tabs: {
        privacy: 'Confidentialitate',
        necessary: 'Necesare',
        analytics: 'Statistice',
        marketing: 'Marketing',
        preferences: 'Preferinţe'
      },
      buttons: {
        acceptSelection: 'Acceptă selecţia',
        rejectAll: 'Respinge toate',
        acceptAll: 'Acceptă toate'
      },
      links: {
        moreInfo: 'More information',
        cookieDetails: 'Cookies Details'
      }
    }
  }
}

// Default consent state
export const DEFAULT_CONSENT_STATE = {
  version: COOKIE_CONSENT_CONFIG.version,
  timestamp: null,
  categories: {},
  hasConsented: false
}
