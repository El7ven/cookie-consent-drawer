/**
 * Geo GDPR Detection — auto-detect user region for consent rules
 * EU/UK → show banner, US → optional, other → configurable
 * @module GeoDetector
 */

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO'
]

const CCPA_STATES = ['CA']

const REGION_RULES = {
  gdpr: { showBanner: true, requireExplicit: true, rejectButton: true },
  ccpa: { showBanner: true, requireExplicit: false, rejectButton: true },
  none: { showBanner: false, requireExplicit: false, rejectButton: false }
}

export class GeoDetector {
  constructor(consentManager, options = {}) {
    this.manager = consentManager
    this.defaultRegion = options.defaultRegion || 'unknown'
    this.apiUrl = options.apiUrl || null
    this.apiKey = options.apiKey || null
    this.provider = options.provider || 'auto' // 'auto' | 'ipapi' | 'ipstack' | 'manual'
    this._region = null
    this._country = null
    this._detected = false
  }

  /**
   * Detect user's region
   * @returns {Promise<{country: string, region: string, rules: Object}>}
   */
  async detect() {
    if (this._detected) {
      return this.getResult()
    }

    try {
      if (this.provider === 'manual') {
        this._region = this.defaultRegion
        this._detected = true
        return this.getResult()
      }

      const data = await this._fetchGeoData()
      this._country = data.country
      this._region = this._classifyRegion(data.country, data.state)
      this._detected = true

      this.manager._debug('GeoDetector: detected', {
        country: this._country,
        region: this._region
      })

      return this.getResult()
    } catch (e) {
      this.manager._debug('GeoDetector: detection failed, using default', e.message)
      this._region = this.defaultRegion === 'gdpr' ? 'gdpr' : 'none'
      this._detected = true
      return this.getResult()
    }
  }

  getResult() {
    const region = this._region || 'gdpr' // default to gdpr for safety
    return {
      country: this._country,
      region,
      rules: REGION_RULES[region] || REGION_RULES.gdpr,
      detected: this._detected
    }
  }

  /**
   * Check if banner should be shown based on region
   */
  shouldShowBanner() {
    const result = this.getResult()
    return result.rules.showBanner
  }

  /**
   * Check if explicit consent is required
   */
  requiresExplicitConsent() {
    const result = this.getResult()
    return result.rules.requireExplicit
  }

  // --- Internal ---

  _classifyRegion(country, state) {
    if (EU_COUNTRIES.includes(country)) return 'gdpr'
    if (country === 'US' && CCPA_STATES.includes(state)) return 'ccpa'
    if (country === 'BR') return 'gdpr' // LGPD similar to GDPR
    return 'none'
  }

  async _fetchGeoData() {
    // Try multiple free providers
    const providers = [
      () => this._fetchIpApi(),
      () => this._fetchCustom()
    ]

    for (const provider of providers) {
      try {
        return await provider()
      } catch (e) {
        continue
      }
    }

    throw new Error('All geo providers failed')
  }

  async _fetchIpApi() {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) throw new Error('ipapi failed')
    const data = await res.json()
    return {
      country: data.country_code,
      state: data.region_code
    }
  }

  async _fetchCustom() {
    if (!this.apiUrl) throw new Error('No custom API URL')
    const url = this.apiKey ? `${this.apiUrl}?key=${this.apiKey}` : this.apiUrl
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) throw new Error('Custom API failed')
    return await res.json()
  }
}

export { EU_COUNTRIES, CCPA_STATES, REGION_RULES }
