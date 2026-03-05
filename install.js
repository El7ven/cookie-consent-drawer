import { createApp } from 'vue'
import { createPinia } from 'pinia'
import CookieConsent from './CookieConsent.vue'
import CookieDrawer from './CookieDrawer.vue'
import { COOKIE_CONSENT_CONFIG } from './config.js'

/**
 * Install Cookie Consent component globally
 * @param {Object} app - Vue app instance
 * @param {Object} options - Installation options
 */
export function installCookieConsent(app, options = {}) {
  const installOptions = {
    componentName: 'cookie-consent',
    autoMount: true,
    mountSelector: '#cookie-consent-mount',
    ...options
  }

  app.component(installOptions.componentName, CookieConsent)

  if (installOptions.autoMount) {
    const mountElement = document.querySelector(installOptions.mountSelector)
    if (mountElement) {
      // Create config with debug option
      const componentConfig = { ...COOKIE_CONSENT_CONFIG }
      if (options.debug !== undefined) {
        componentConfig.debug = options.debug
      }

      const consentApp = createApp(CookieConsent, { config: componentConfig })

      consentApp.component('CookieDrawer', CookieDrawer)

      if (app._context?.provides?.pinia) {
        consentApp.use(app._context.provides.pinia)
      } else {
        consentApp.use(createPinia())
      }

      try {
        consentApp.mount(mountElement)
      } catch (error) {
        console.error('[CookieDrawer] Failed to mount component:', error)
      }
    }
  }

  return {
    component: CookieConsent,
    config: COOKIE_CONSENT_CONFIG,
    componentName: installOptions.componentName
  }
}

/**
 * Initialize Cookie Consent with backward compatibility
 * @param {Object} app - Vue app instance
 * @param {Object} pinia - Pinia instance
 * @param {Object} options - Additional options
 */
export function initCookieConsent(app, pinia, options = {}) {
  const { component, config } = installCookieConsent(app, options)

  const legacyKey = options.legacyStorageKey || 'cookies_consent'
  const legacyConsent = localStorage.getItem(legacyKey)
  const newConsent = localStorage.getItem(config.storageKey)

  if (newConsent) {
    try {
      const parsed = JSON.parse(newConsent)
      if (parsed.hasConsented && parsed.version === config.version) {
        return { component, config, status: 'already-consented' }
      }
    } catch (e) {
      localStorage.removeItem(config.storageKey)
    }
  }

  if (legacyConsent && !newConsent) {
    try {
      const parsed = JSON.parse(legacyConsent)
      if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
        const migratedConsent = {
          version: config.version,
          timestamp: Date.now(),
          hasConsented: true,
          categories: {
            necessary: true,
            analytics: parsed.analytics || false,
            marketing: parsed.marketing || false,
            preferences: parsed.preferences || false
          }
        }

        localStorage.setItem(config.storageKey, JSON.stringify(migratedConsent))
        localStorage.removeItem(legacyKey)

        return { component, config, status: 'migrated' }
      }
    } catch (e) {
      localStorage.removeItem(legacyKey)
    }
  }

  if (options.showLegacyModal && legacyConsent) {
    const modal = options.useModalStore ? options.useModalStore(pinia) : null
    const t = options.translator || app._context?.provides?.t

    if (modal && typeof t === 'function') {
      setTimeout(() => {
        modal.cookies({
          title: t('modal_title_cookies'),
          message: t('modal_message_cookies'),
        })
      }, options.legacyDelay || 5000)
    }
  }

  return { component, config, status: 'ready' }
}

export const CookieConsentPlugin = {
  install(app, options = {}) {
    return installCookieConsent(app, options)
  }
}

export default {
  install: installCookieConsent,
  init: initCookieConsent,
  plugin: CookieConsentPlugin,
  CookieConsent,
  config: COOKIE_CONSENT_CONFIG
}
