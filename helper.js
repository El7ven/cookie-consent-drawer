// Cookie Consent Drawer Helper
// Universal helper for installing and managing Cookie Consent Drawer

import { initCookieConsent } from './install.js'

/**
 * Initialize Cookie Consent Drawer for any Vue 3 project
 * @param {Object} app - Vue app instance
 * @param {Object} pinia - Pinia store instance
 * @param {Object} options - Configuration options
 */
export function initCookieDrawer(app, pinia, options = {}) {
  // Default options
  const defaultOptions = {
    componentName: 'cookie-consent',
    autoMount: true,
    mountSelector: '#cookie-consent-mount',
    customConfig: null,
    translator: null,
    debug: false
  }

  // Merge options
  const config = { ...defaultOptions, ...options }

  // Debug logging
  if (config.debug) {
    console.log('[CookieDrawer] Initializing with options:', config)
  }

  // Initialize with backward compatibility
  const { component, config: moduleConfig, status } = initCookieConsent(app, pinia, {
    componentName: config.componentName,
    autoMount: config.autoMount,
    mountSelector: config.mountSelector,
    customConfig: config.customConfig,
    showLegacyModal: false, // We don't want legacy modal for drawer
    debug: config.debug
  })

  // Debug logging after initialization
  if (config.debug) {
    // Check current consent state
    const currentConsent = localStorage.getItem(moduleConfig.storageKey)
    console.log('[CookieDrawer] Current consent in storage:', currentConsent)
    
    if (currentConsent) {
      try {
        const parsed = JSON.parse(currentConsent)
        console.log('[CookieDrawer] Parsed consent:', parsed)
        console.log('[CookieDrawer] Has consented:', parsed.hasConsented)
        console.log('[CookieDrawer] Version matches:', parsed.version === moduleConfig.version)
      } catch (e) {
        console.log('[CookieDrawer] Invalid consent format')
      }
    } else {
      console.log('[CookieDrawer] No consent found - drawer should appear')
    }
  }

  // Log initialization status
  if (config.debug) {
    console.log('[CookieDrawer] Initialization status:', status)
    console.log('[CookieDrawer] Module config:', moduleConfig)
  }

  // Return initialization result
  return {
    component,
    config: moduleConfig,
    status,
    // Helper methods
    methods: {
      // Check if user has consent
      hasConsent: () => {
        const consent = localStorage.getItem(moduleConfig.storageKey)
        if (!consent) return false
        
        try {
          const parsed = JSON.parse(consent)
          return parsed.hasConsented && parsed.version === moduleConfig.version
        } catch (e) {
          return false
        }
      },

      // Check specific category consent
      hasCategoryConsent: (categoryId) => {
        const consent = localStorage.getItem(moduleConfig.storageKey)
        if (!consent) return false
        
        try {
          const parsed = JSON.parse(consent)
          return parsed.categories?.[categoryId] === true
        } catch (e) {
          return false
        }
      },

      // Clear all consent data
      clearConsent: () => {
        localStorage.removeItem(moduleConfig.storageKey)
        if (config.debug) {
          console.log('[CookieDrawer] Consent cleared')
        }
      },

      // Reset consent (show drawer again)
      resetConsent: () => {
        localStorage.removeItem(moduleConfig.storageKey)
        window.location.reload() // Reload to show drawer again
      },

      // Get current consent data
      getConsentData: () => {
        const consent = localStorage.getItem(moduleConfig.storageKey)
        if (!consent) return null
        
        try {
          return JSON.parse(consent)
        } catch (e) {
          return null
        }
      }
    }
  }
}

/**
 * Simple installation function for quick setup
 * @param {Object} app - Vue app instance
 * @param {Object} pinia - Pinia store instance
 * @param {Object} options - Additional options
 */
export function installCookieDrawer(app, pinia, options = {}) {
  return initCookieDrawer(app, pinia, {
    autoMount: true,
    mountSelector: '#cookie-consent-mount',
    ...options
  })
}

/**
 * Vue plugin for easy installation
 */
export const CookieDrawerPlugin = {
  install(app, options = {}) {
    return {
      init: (pinia) => initCookieDrawer(app, pinia, options)
    }
  }
}

/**
 * Auto-initialization for app.js
 * Call this in your main app file
 */
export function autoInitCookieDrawer(app, pinia, options = {}) {
  if (typeof window === 'undefined') return null
  
  const mountPoint = document.querySelector('#cookie-consent-mount')
  if (!mountPoint) {
    return null
  }

  const result = initCookieDrawer(app, pinia, {
    autoMount: true,
    mountSelector: '#cookie-consent-mount',
    ...options
  })
  
  return result
}

// Default export
export default {
  init: initCookieDrawer,
  install: installCookieDrawer,
  autoInit: autoInitCookieDrawer,
  plugin: CookieDrawerPlugin
}
