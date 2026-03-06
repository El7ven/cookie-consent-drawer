/**
 * Google Consent Mode v2 Integration
 * Automatically syncs cookie consent with Google's Consent API
 * @module ConsentMode
 */

const CONSENT_MODE_DEFAULTS = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted'
}

// Mapping: cookie category → Google consent types
const CATEGORY_MAPPING = {
  necessary: ['security_storage'],
  analytics: ['analytics_storage'],
  marketing: ['ad_storage', 'ad_user_data', 'ad_personalization'],
  preferences: ['functionality_storage', 'personalization_storage']
}

export class ConsentMode {
  constructor(consentManager, options = {}) {
    this.manager = consentManager
    this.enabled = options.enabled !== false
    this.categoryMapping = { ...CATEGORY_MAPPING, ...options.categoryMapping }
    this.waitForUpdate = options.waitForUpdate || 500
    this._initialized = false

    if (this.enabled) {
      this._init()
    }
  }

  _init() {
    if (typeof window === 'undefined') return
    if (this._initialized) return

    // Ensure dataLayer exists
    window.dataLayer = window.dataLayer || []

    // Set default consent state (denied for everything except security)
    this._gtag('consent', 'default', {
      ...CONSENT_MODE_DEFAULTS,
      wait_for_update: this.waitForUpdate
    })

    this.manager._debug('ConsentMode: defaults set', CONSENT_MODE_DEFAULTS)

    // Check if user already has consent
    const existing = this.manager.getConsent()
    if (existing?.hasConsented) {
      this._updateFromCategories(existing.categories)
    }

    // Listen for consent changes
    this.manager.on('consentChanged', ({ categories }) => {
      this._updateFromCategories(categories)
    })

    this._initialized = true
  }

  _updateFromCategories(categories) {
    const consentUpdate = {}

    Object.entries(this.categoryMapping).forEach(([category, gtagKeys]) => {
      const granted = categories[category] === true
      gtagKeys.forEach(key => {
        consentUpdate[key] = granted ? 'granted' : 'denied'
      })
    })

    this._gtag('consent', 'update', consentUpdate)
    this.manager._debug('ConsentMode: updated', consentUpdate)
  }

  _gtag() {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(arguments)
  }

  // Get current consent mode state
  getState() {
    const consent = this.manager.getConsent()
    if (!consent?.hasConsented) {
      return { ...CONSENT_MODE_DEFAULTS }
    }

    const state = { ...CONSENT_MODE_DEFAULTS }
    Object.entries(this.categoryMapping).forEach(([category, gtagKeys]) => {
      const granted = consent.categories[category] === true
      gtagKeys.forEach(key => {
        state[key] = granted ? 'granted' : 'denied'
      })
    })
    return state
  }

  destroy() {
    this._initialized = false
  }
}

export { CONSENT_MODE_DEFAULTS, CATEGORY_MAPPING }
