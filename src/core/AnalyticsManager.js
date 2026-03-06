/**
 * Analytics Manager — integrations with popular analytics services
 * GA4, GTM, Meta Pixel, TikTok Pixel, Hotjar
 * @module AnalyticsManager
 */

const ANALYTICS_PROVIDERS = {
  ga4: {
    category: 'analytics',
    load: (config) => {
      const id = config.GA_ID || config.id
      if (!id) return

      window.dataLayer = window.dataLayer || []
      function gtag() { window.dataLayer.push(arguments) }
      gtag('js', new Date())
      gtag('config', id, config.options || {})

      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
      document.head.appendChild(script)

      return script
    },
    unload: (config) => {
      const id = config.GA_ID || config.id
      // Remove GA cookies
      const cookies = document.cookie.split(';')
      cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name.startsWith('_ga') || name.startsWith('_gid')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
      // Remove script tag
      const scripts = document.querySelectorAll(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)
      scripts.forEach(s => s.remove())
    }
  },

  gtm: {
    category: 'analytics',
    load: (config) => {
      const id = config.GTM_ID || config.id
      if (!id) return

      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      })

      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`
      document.head.appendChild(script)

      return script
    },
    unload: (config) => {
      const id = config.GTM_ID || config.id
      const scripts = document.querySelectorAll(`script[src*="googletagmanager.com/gtm.js?id=${id}"]`)
      scripts.forEach(s => s.remove())
    }
  },

  metaPixel: {
    category: 'marketing',
    load: (config) => {
      const id = config.PIXEL_ID || config.id
      if (!id) return

      /* eslint-disable */
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */

      window.fbq('init', id)
      window.fbq('track', 'PageView')
    },
    unload: () => {
      delete window.fbq
      delete window._fbq
      const scripts = document.querySelectorAll('script[src*="connect.facebook.net"]')
      scripts.forEach(s => s.remove())
    }
  },

  tiktokPixel: {
    category: 'marketing',
    load: (config) => {
      const id = config.TIKTOK_ID || config.id
      if (!id) return

      /* eslint-disable */
      !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
      ttq._o=ttq._o||{};ttq._o[e]=n||{};
      var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      }(window,document,"ttq");
      /* eslint-enable */

      window.ttq.load(id)
      window.ttq.page()
    },
    unload: () => {
      delete window.ttq
      const scripts = document.querySelectorAll('script[src*="analytics.tiktok.com"]')
      scripts.forEach(s => s.remove())
    }
  },

  hotjar: {
    category: 'analytics',
    load: (config) => {
      const id = config.HOTJAR_ID || config.id
      if (!id) return

      /* eslint-disable */
      ;(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:id,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      /* eslint-enable */
    },
    unload: () => {
      delete window.hj
      delete window._hjSettings
      const scripts = document.querySelectorAll('script[src*="static.hotjar.com"]')
      scripts.forEach(s => s.remove())
    }
  }
}

export class AnalyticsManager {
  constructor(consentManager, config = {}) {
    this.manager = consentManager
    this.config = config
    this.activeProviders = new Set()

    this._init()
  }

  _init() {
    if (typeof window === 'undefined') return

    // Listen for consent changes
    this.manager.on('consentChanged', ({ categories }) => {
      this._syncProviders(categories)
    })

    // Check existing consent
    const consent = this.manager.getConsent()
    if (consent?.hasConsented) {
      this._syncProviders(consent.categories)
    }

    this.manager._debug('AnalyticsManager: initialized')
  }

  _syncProviders(categories) {
    Object.entries(this.config).forEach(([providerName, providerConfig]) => {
      const provider = ANALYTICS_PROVIDERS[providerName]
      if (!provider) return

      const category = providerConfig.category || provider.category
      const granted = categories[category] === true

      if (granted && !this.activeProviders.has(providerName)) {
        // Load provider
        try {
          provider.load(providerConfig)
          this.activeProviders.add(providerName)
          this.manager._debug('AnalyticsManager: loaded', providerName)
        } catch (e) {
          this.manager._debug('AnalyticsManager: load error', providerName, e)
        }
      } else if (!granted && this.activeProviders.has(providerName)) {
        // Unload provider
        try {
          provider.unload(providerConfig)
          this.activeProviders.delete(providerName)
          this.manager._debug('AnalyticsManager: unloaded', providerName)
        } catch (e) {
          this.manager._debug('AnalyticsManager: unload error', providerName, e)
        }
      }
    })
  }

  /**
   * Register a custom analytics provider
   */
  registerProvider(name, provider) {
    ANALYTICS_PROVIDERS[name] = provider
    this.manager._debug('AnalyticsManager: registered custom provider', name)
  }

  /**
   * Get active providers
   */
  getActiveProviders() {
    return [...this.activeProviders]
  }

  destroy() {
    // Unload all active providers
    this.activeProviders.forEach(name => {
      const provider = ANALYTICS_PROVIDERS[name]
      if (provider?.unload) {
        provider.unload(this.config[name] || {})
      }
    })
    this.activeProviders.clear()
  }
}

export { ANALYTICS_PROVIDERS }
