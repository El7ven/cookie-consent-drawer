import { COOKIE_CONSENT_CONFIG, DEFAULT_CONSENT_STATE } from './config.js'

export class CookieConsentManager {
  constructor(config = COOKIE_CONSENT_CONFIG) {
    this.config = config
    this.storageKey = config.storageKey
  }

  // Get current consent state
  getConsent() {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return null
      
      const consent = JSON.parse(stored)
      
      if (consent.version !== this.config.version) {
        return null
      }
      
      const MAX_AGE = 15552000000
      if (consent.timestamp && (Date.now() - consent.timestamp > MAX_AGE)) {
        return null
      }
      
      return consent
    } catch (error) {
      return null
    }
  }

  // Save consent state
  saveConsent(consentData) {
    if (typeof window === 'undefined') return null
    
    try {
      const consent = {
        ...DEFAULT_CONSENT_STATE,
        ...consentData,
        version: this.config.version,
        timestamp: Date.now(),
        hasConsented: true
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(consent))
      
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
        detail: { consent, categories: consent.categories }
      }))
      
      return consent
    } catch (error) {
      return null
    }
  }

  hasConsent() {
    const consent = this.getConsent()
    return consent && consent.hasConsented
  }

  hasCategoryConsent(categoryId) {
    const consent = this.getConsent()
    return consent && consent.categories[categoryId] === true
  }

  acceptAll() {
    const categories = {}
    Object.keys(this.config.categories).forEach(categoryId => {
      categories[categoryId] = this.config.categories[categoryId].enabled || this.config.categories[categoryId].required
    })
    
    return this.saveConsent({ categories })
  }

  rejectAll() {
    const categories = {}
    Object.keys(this.config.categories).forEach(categoryId => {
      categories[categoryId] = this.config.categories[categoryId].required
    })
    
    return this.saveConsent({ categories })
  }

  // Accept selected categories
  acceptSelected(selectedCategories) {
    const categories = {}
    Object.keys(this.config.categories).forEach(categoryId => {
      categories[categoryId] = selectedCategories.includes(categoryId) || 
                              this.config.categories[categoryId].required
    })
    
    return this.saveConsent({ categories })
  }

  // Clear consent
  clearConsent() {
    try {
      localStorage.removeItem(this.storageKey)
      window.dispatchEvent(new CustomEvent('cookieConsentCleared'))
      return true
    } catch (error) {
      return false
    }
  }

  // Get enabled categories based on config
  getEnabledCategories() {
    return Object.keys(this.config.categories).filter(
      categoryId => this.config.categories[categoryId].enabled
    )
  }

  getRequiredCategories() {
    return Object.keys(this.config.categories).filter(
      categoryId => this.config.categories[categoryId].required
    )
  }

  getDefaultCategoriesState() {
    const categories = {}
    Object.keys(this.config.categories).forEach(categoryId => {
      const category = this.config.categories[categoryId]
      categories[categoryId] = category.required || false
    })
    return categories
  }
}

export const cookieConsentManager = new CookieConsentManager()

export const hasConsent = () => cookieConsentManager.hasConsent()
export const hasCategoryConsent = (categoryId) => cookieConsentManager.hasCategoryConsent(categoryId)
export const acceptAllCookies = () => cookieConsentManager.acceptAll()
export const rejectAllCookies = () => cookieConsentManager.rejectAll()
export const clearCookieConsent = () => cookieConsentManager.clearConsent()
