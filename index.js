export { default as CookieConsent } from './CookieConsent.vue'
export { default as CookieDrawer } from './CookieDrawer.vue'
export { useCookieConsent } from './useCookieConsent.js'
export { cookieConsentManager } from './utils.js'

// Export CSS
import './styles.css'

export {
  hasConsent,
  hasCategoryConsent,
  acceptAllCookies,
  rejectAllCookies,
  clearCookieConsent
} from './utils.js'

export { COOKIE_CONSENT_CONFIG, DEFAULT_CONSENT_STATE } from './config.js'

// v2 exports available via src/
export { CookieConsentPlugin } from './src/index.js'
export { ConsentManager } from './src/core/ConsentManager.js'

