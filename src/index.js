/**
 * @el7ven/cookie-consent-drawer v2.0
 * Modern, enterprise-grade cookie consent library for Vue 3
 */

// Core
export { ConsentManager, DEFAULT_CONFIG, DEFAULT_CONSENT_STATE } from './core/ConsentManager.js'
export { ConsentMode, CONSENT_MODE_DEFAULTS, CATEGORY_MAPPING } from './core/ConsentMode.js'
export { ScriptLoader } from './core/ScriptLoader.js'
export { FocusTrap } from './core/FocusTrap.js'
export { GeoDetector, EU_COUNTRIES, REGION_RULES } from './core/GeoDetector.js'
export { AnalyticsManager, ANALYTICS_PROVIDERS } from './core/AnalyticsManager.js'

// Composables
export { useCookieConsent } from './composables/useCookieConsent.js'

// Components
export { default as CookieConsent } from '../CookieConsent.vue'
export { default as CookieDrawer } from '../CookieDrawer.vue'

// Themes
import './themes/default.css'

// Plugin
import { ConsentManager as _ConsentManager } from './core/ConsentManager.js'
import _CookieConsent from '../CookieConsent.vue'

export const CookieConsentPlugin = {
  install(app, options = {}) {
    const manager = new _ConsentManager(options)

    app.provide('cookieConsent', manager)
    app.config.globalProperties.$cookieConsent = manager

    if (options.globalComponent !== false) {
      app.component('CookieConsent', _CookieConsent)
    }

    return manager
  }
}

export default CookieConsentPlugin
