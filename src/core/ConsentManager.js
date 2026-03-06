/**
 * Core Consent Manager — handles consent state, persistence, and events
 * @module ConsentManager
 */

const DEFAULT_CONFIG = {
  version: '2.0.0',
  storageKey: 'cookie_consent',
  storageType: 'localStorage', // 'localStorage' | 'cookie' | 'both'
  cookieExpiry: 180, // days
  mode: 'gdpr', // 'gdpr' | 'ccpa' | 'lgpd' | 'essential'
  debug: false,
  categories: {},
  revision: 0
}

const DEFAULT_CONSENT_STATE = {
  version: null,
  revision: 0,
  timestamp: null,
  categories: {},
  hasConsented: false
}

export class ConsentManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.listeners = new Map()
    this._normalizeCategories()
    this._debug('ConsentManager initialized', this.config)
  }

  // --- Category Normalization ---

  _normalizeCategories() {
    const raw = this.config.categories
    if (Array.isArray(raw)) {
      this.config.categories = raw.reduce((acc, cat) => {
        acc[cat.id] = cat
        return acc
      }, {})
    }
  }

  getCategories() {
    return { ...this.config.categories }
  }

  getRequiredCategories() {
    return Object.keys(this.config.categories).filter(
      id => this.config.categories[id].required
    )
  }

  getOptionalCategories() {
    return Object.keys(this.config.categories).filter(
      id => !this.config.categories[id].required
    )
  }

  // --- Consent State ---

  getConsent() {
    if (typeof window === 'undefined') return null

    try {
      const stored = this._read()
      if (!stored) return null

      const consent = JSON.parse(stored)

      // Version mismatch — re-consent needed
      if (consent.version !== this.config.version) {
        this._debug('Version mismatch, clearing consent')
        return null
      }

      // Revision mismatch — re-consent needed
      if (consent.revision !== this.config.revision) {
        this._debug('Revision changed, clearing consent')
        return null
      }

      // Expiry check
      const maxAge = this.config.cookieExpiry * 24 * 60 * 60 * 1000
      if (consent.timestamp && (Date.now() - consent.timestamp > maxAge)) {
        this._debug('Consent expired')
        return null
      }

      return consent
    } catch (e) {
      this._debug('Error reading consent', e)
      return null
    }
  }

  saveConsent(categories) {
    if (typeof window === 'undefined') return null

    // Ensure required categories are always true
    const finalCategories = { ...categories }
    this.getRequiredCategories().forEach(id => {
      finalCategories[id] = true
    })

    const consent = {
      ...DEFAULT_CONSENT_STATE,
      version: this.config.version,
      revision: this.config.revision,
      timestamp: Date.now(),
      categories: finalCategories,
      hasConsented: true
    }

    try {
      this._write(JSON.stringify(consent))
      this._debug('Consent saved', consent)
      this._emit('consentChanged', { consent, categories: finalCategories })

      // Emit per-category events
      Object.keys(finalCategories).forEach(catId => {
        this._emit('categoryChanged', {
          category: catId,
          granted: finalCategories[catId]
        })
      })

      return consent
    } catch (e) {
      this._debug('Error saving consent', e)
      return null
    }
  }

  hasConsent() {
    const consent = this.getConsent()
    return consent?.hasConsented === true
  }

  hasCategoryConsent(categoryId) {
    const consent = this.getConsent()
    return consent?.categories?.[categoryId] === true
  }

  acceptAll() {
    const categories = {}
    Object.keys(this.config.categories).forEach(id => {
      categories[id] = true
    })
    this._debug('Accept all')
    return this.saveConsent(categories)
  }

  rejectAll() {
    const categories = {}
    Object.keys(this.config.categories).forEach(id => {
      categories[id] = this.config.categories[id].required || false
    })
    this._debug('Reject all')
    return this.saveConsent(categories)
  }

  acceptSelected(selectedIds) {
    const categories = {}
    Object.keys(this.config.categories).forEach(id => {
      categories[id] = selectedIds.includes(id) || this.config.categories[id].required
    })
    this._debug('Accept selected', selectedIds)
    return this.saveConsent(categories)
  }

  clearConsent() {
    try {
      this._remove()
      this._debug('Consent cleared')
      this._emit('consentCleared', {})
      return true
    } catch (e) {
      return false
    }
  }

  getDefaultCategoriesState() {
    const categories = {}
    Object.keys(this.config.categories).forEach(id => {
      categories[id] = this.config.categories[id].required || false
    })
    return categories
  }

  // --- Storage Abstraction ---

  _read() {
    const { storageType, storageKey } = this.config

    if (storageType === 'cookie' || storageType === 'both') {
      const cookie = this._readCookie(storageKey)
      if (cookie) return cookie
    }

    if (storageType === 'localStorage' || storageType === 'both') {
      return localStorage.getItem(storageKey)
    }

    return null
  }

  _write(value) {
    const { storageType, storageKey, cookieExpiry } = this.config

    if (storageType === 'localStorage' || storageType === 'both') {
      localStorage.setItem(storageKey, value)
    }

    if (storageType === 'cookie' || storageType === 'both') {
      this._writeCookie(storageKey, value, cookieExpiry)
    }
  }

  _remove() {
    const { storageType, storageKey } = this.config

    if (storageType === 'localStorage' || storageType === 'both') {
      localStorage.removeItem(storageKey)
    }

    if (storageType === 'cookie' || storageType === 'both') {
      this._writeCookie(storageKey, '', -1)
    }
  }

  _readCookie(name) {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  }

  _writeCookie(name, value, days) {
    if (typeof document === 'undefined') return
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
  }

  // --- Event System ---

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return
    const list = this.listeners.get(event).filter(cb => cb !== callback)
    this.listeners.set(event, list)
  }

  _emit(event, data) {
    this._debug(`Event: ${event}`, data)

    // Internal listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data))
    }

    // DOM CustomEvent
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`cookieConsent:${event}`, { detail: data }))
    }
  }

  // --- Debug ---

  _debug(...args) {
    if (this.config.debug) {
      console.log('[CookieConsent]', ...args)
    }
  }
}

export { DEFAULT_CONFIG, DEFAULT_CONSENT_STATE }
