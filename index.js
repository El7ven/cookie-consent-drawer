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

export {
  installCookieConsent,
  initCookieConsent,
  CookieConsentPlugin
} from './install.js'

export {
  initCookieDrawer,
  installCookieDrawer,
  autoInitCookieDrawer,
  CookieDrawerPlugin
} from './helper.js'

export { default } from './install.js'
