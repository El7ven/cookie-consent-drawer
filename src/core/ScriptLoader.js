/**
 * Script Loader System — blocks/unblocks scripts based on consent
 * Supports inline and external scripts with data-cookiecategory attribute
 * @module ScriptLoader
 */

export class ScriptLoader {
  constructor(consentManager) {
    this.manager = consentManager
    this.loadedScripts = new Map()
    this.blockedScripts = []
    this._observer = null

    this._init()
  }

  _init() {
    if (typeof window === 'undefined') return

    // Scan existing scripts on page
    this._scanBlockedScripts()

    // Watch for new scripts added to DOM
    this._observeDOM()

    // Listen for consent changes
    this.manager.on('consentChanged', ({ categories }) => {
      this._onConsentChanged(categories)
    })

    // Check if consent already exists
    const consent = this.manager.getConsent()
    if (consent?.hasConsented) {
      this._onConsentChanged(consent.categories)
    }

    this.manager._debug('ScriptLoader: initialized')
  }

  // --- Public API ---

  /**
   * Register a script to load when category consent is granted
   * @param {string} category - Cookie category id
   * @param {string} src - Script URL
   * @param {Object} options - Script attributes
   */
  register(category, src, options = {}) {
    const script = { category, src, options, loaded: false }
    this.blockedScripts.push(script)

    // Check if already consented
    if (this.manager.hasCategoryConsent(category)) {
      this._loadScript(script)
    }

    this.manager._debug('ScriptLoader: registered', { category, src })
    return this
  }

  /**
   * Load a script immediately (bypasses consent check)
   */
  loadImmediate(src, options = {}) {
    return this._injectScript(src, options)
  }

  /**
   * Remove all scripts for a category
   */
  removeCategory(category) {
    this.loadedScripts.forEach((info, element) => {
      if (info.category === category) {
        element.remove()
        this.loadedScripts.delete(element)
        this.manager._debug('ScriptLoader: removed script', info.src)
      }
    })
  }

  /**
   * Get all registered scripts and their status
   */
  getStatus() {
    return this.blockedScripts.map(s => ({
      category: s.category,
      src: s.src,
      loaded: s.loaded
    }))
  }

  // --- Internal ---

  _scanBlockedScripts() {
    if (typeof document === 'undefined') return

    const scripts = document.querySelectorAll('script[data-cookiecategory]')
    scripts.forEach(script => {
      const category = script.getAttribute('data-cookiecategory')
      const src = script.getAttribute('data-src') || script.src

      if (script.type === 'text/plain') {
        // Blocked script — store for later activation
        this.blockedScripts.push({
          category,
          src,
          options: { inline: !src, content: script.textContent },
          element: script,
          loaded: false
        })
        this.manager._debug('ScriptLoader: found blocked script', { category, src })
      }
    })
  }

  _observeDOM() {
    if (typeof MutationObserver === 'undefined') return

    this._observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'SCRIPT' && node.getAttribute('data-cookiecategory')) {
            const category = node.getAttribute('data-cookiecategory')
            if (node.type === 'text/plain') {
              this.blockedScripts.push({
                category,
                src: node.getAttribute('data-src') || node.src,
                options: { inline: !node.src, content: node.textContent },
                element: node,
                loaded: false
              })
            }
          }
        })
      })
    })

    this._observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    })
  }

  _onConsentChanged(categories) {
    Object.entries(categories).forEach(([catId, granted]) => {
      if (granted) {
        // Load all scripts for this category
        this.blockedScripts
          .filter(s => s.category === catId && !s.loaded)
          .forEach(s => this._loadScript(s))
      } else {
        // Remove scripts for rejected category
        this.removeCategory(catId)
      }
    })
  }

  _loadScript(scriptInfo) {
    if (scriptInfo.loaded) return

    if (scriptInfo.options?.inline && scriptInfo.options?.content) {
      // Inline script
      this._injectInlineScript(scriptInfo)
    } else if (scriptInfo.src) {
      // External script
      this._injectScript(scriptInfo.src, {
        ...scriptInfo.options,
        category: scriptInfo.category
      })
    }

    scriptInfo.loaded = true
    this.manager._debug('ScriptLoader: loaded', scriptInfo.src || 'inline')
  }

  _injectScript(src, options = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = options.async !== false

      if (options.id) script.id = options.id
      if (options.defer) script.defer = true
      if (options.crossOrigin) script.crossOrigin = options.crossOrigin

      script.onload = () => {
        this.manager._debug('ScriptLoader: script loaded', src)
        resolve(script)
      }
      script.onerror = (err) => {
        this.manager._debug('ScriptLoader: script error', src, err)
        reject(err)
      }

      document.head.appendChild(script)

      this.loadedScripts.set(script, {
        src,
        category: options.category,
        loaded: true
      })
    })
  }

  _injectInlineScript(scriptInfo) {
    const script = document.createElement('script')
    script.textContent = scriptInfo.options.content
    document.head.appendChild(script)

    // Remove original blocked script
    if (scriptInfo.element) {
      scriptInfo.element.remove()
    }

    this.loadedScripts.set(script, {
      src: 'inline',
      category: scriptInfo.category,
      loaded: true
    })
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect()
    }
    this.loadedScripts.clear()
    this.blockedScripts = []
  }
}
