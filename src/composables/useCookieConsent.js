/**
 * Vue 3 Composable — useCookieConsent v2
 * Reactive consent management with all v2 features
 * @module useCookieConsent
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ConsentManager, DEFAULT_CONFIG } from '../core/ConsentManager.js'
import { ConsentMode } from '../core/ConsentMode.js'
import { ScriptLoader } from '../core/ScriptLoader.js'
import { FocusTrap } from '../core/FocusTrap.js'
import { GeoDetector } from '../core/GeoDetector.js'
import { AnalyticsManager } from '../core/AnalyticsManager.js'

// Singleton instances
let _manager = null
let _consentMode = null
let _scriptLoader = null
let _focusTrap = null
let _geoDetector = null
let _analyticsManager = null

export function useCookieConsent(userConfig = {}) {
  const config = { ...DEFAULT_CONFIG, ...userConfig }

  // Initialize core manager (singleton)
  if (!_manager) {
    _manager = new ConsentManager(config)
  }

  // --- Reactive State ---
  const isVisible = ref(false)
  const isSettingsMode = ref(false)
  const currentTab = ref('privacy')
  const categories = ref({})
  const consent = ref(null)
  const geoResult = ref(null)
  const isLoading = ref(true)

  // --- Computed ---
  const normalizedCategories = computed(() => {
    const raw = config.categories
    if (Array.isArray(raw)) {
      return raw.reduce((acc, cat) => {
        acc[cat.id] = cat
        return acc
      }, {})
    }
    return raw || {}
  })

  const requiredCategories = computed(() =>
    Object.keys(normalizedCategories.value).filter(
      id => normalizedCategories.value[id].required
    )
  )

  const optionalCategories = computed(() =>
    Object.keys(normalizedCategories.value).filter(
      id => !normalizedCategories.value[id].required
    )
  )

  const selectedCategories = computed(() =>
    Object.keys(categories.value).filter(id => categories.value[id])
  )

  const hasConsented = computed(() => consent.value?.hasConsented === true)

  const canAcceptSelection = computed(() =>
    Object.keys(categories.value).some(
      id => !normalizedCategories.value[id]?.required && categories.value[id]
    )
  )

  // --- Google Consent Mode v2 ---
  const initConsentMode = (options = {}) => {
    if (!_consentMode) {
      _consentMode = new ConsentMode(_manager, options)
    }
    return _consentMode
  }

  // --- Script Loader ---
  const initScriptLoader = () => {
    if (!_scriptLoader) {
      _scriptLoader = new ScriptLoader(_manager)
    }
    return _scriptLoader
  }

  // --- Focus Trap ---
  const initFocusTrap = (options = {}) => {
    if (!_focusTrap) {
      _focusTrap = new FocusTrap({
        onEscape: () => close(),
        ...options
      })
    }
    return _focusTrap
  }

  // --- Geo Detection ---
  const initGeoDetection = async (options = {}) => {
    if (!_geoDetector) {
      _geoDetector = new GeoDetector(_manager, options)
    }
    const result = await _geoDetector.detect()
    geoResult.value = result
    return result
  }

  // --- Analytics ---
  const initAnalytics = (analyticsConfig = {}) => {
    if (!_analyticsManager) {
      _analyticsManager = new AnalyticsManager(_manager, analyticsConfig)
    }
    return _analyticsManager
  }

  // --- Actions ---
  const show = () => {
    isVisible.value = true
    isSettingsMode.value = false
    _manager._emit('bannerOpened', {})
  }

  const showSettings = () => {
    isVisible.value = true
    isSettingsMode.value = true
    _manager._emit('settingsOpened', {})
  }

  const close = () => {
    isVisible.value = false
    isSettingsMode.value = false

    if (_focusTrap) {
      _focusTrap.deactivate()
    }

    _manager._emit('bannerClosed', {})
  }

  const acceptAll = () => {
    consent.value = _manager.acceptAll()
    close()
  }

  const rejectAll = () => {
    consent.value = _manager.rejectAll()
    close()
  }

  const acceptSelected = () => {
    const selectedIds = Object.keys(categories.value).filter(id => categories.value[id])
    consent.value = _manager.acceptSelected(selectedIds)
    close()
  }

  const resetConsent = () => {
    _manager.clearConsent()
    consent.value = null
    categories.value = _manager.getDefaultCategoriesState()
  }

  const toggleCategory = (categoryId) => {
    if (normalizedCategories.value[categoryId]?.required) return
    categories.value[categoryId] = !categories.value[categoryId]
  }

  const setTab = (tab) => {
    currentTab.value = tab
  }

  // --- Focus Trap Integration ---
  const activateFocusTrap = (element) => {
    if (_focusTrap) {
      _focusTrap.activate(element)
    }
  }

  const deactivateFocusTrap = () => {
    if (_focusTrap) {
      _focusTrap.deactivate()
    }
  }

  // --- Lifecycle ---
  const initialize = async () => {
    isLoading.value = true

    // Load existing consent
    const existing = _manager.getConsent()
    if (existing) {
      consent.value = existing
      categories.value = { ...existing.categories }
    } else {
      categories.value = _manager.getDefaultCategoriesState()
    }

    // Auto-init features based on config
    if (config.consentMode?.enabled) {
      initConsentMode(config.consentMode)
    }

    if (config.scripts) {
      const loader = initScriptLoader()
      config.scripts.forEach(s => loader.register(s.category, s.src, s.options))
    }

    if (config.analytics) {
      initAnalytics(config.analytics)
    }

    if (config.accessibility !== false) {
      initFocusTrap()
    }

    // Geo detection
    if (config.geo?.autoDetect) {
      await initGeoDetection(config.geo)
    }

    // Show banner if no consent
    if (!existing?.hasConsented) {
      // Check geo rules
      if (geoResult.value && !geoResult.value.rules.showBanner) {
        // Region doesn't require banner
        _manager._debug('Banner not required for region:', geoResult.value.region)
      } else {
        const delay = config.display?.delay || 1000
        setTimeout(() => show(), delay)
      }
    }

    isLoading.value = false
  }

  // Listen for external consent changes
  const _onConsentChanged = ({ consent: newConsent }) => {
    consent.value = newConsent
    categories.value = { ...newConsent.categories }
  }

  onMounted(() => {
    _manager.on('consentChanged', _onConsentChanged)
    initialize()
  })

  onUnmounted(() => {
    _manager.off('consentChanged', _onConsentChanged)
  })

  // --- Public API ---
  return {
    // State
    isVisible,
    isSettingsMode,
    isLoading,
    currentTab,
    categories,
    consent,
    geoResult,

    // Computed
    normalizedCategories,
    requiredCategories,
    optionalCategories,
    selectedCategories,
    hasConsented,
    canAcceptSelection,

    // Actions
    show,
    showSettings,
    close,
    acceptAll,
    rejectAll,
    acceptSelected,
    resetConsent,
    toggleCategory,
    setTab,

    // Focus Trap
    activateFocusTrap,
    deactivateFocusTrap,

    // Feature initializers
    initConsentMode,
    initScriptLoader,
    initFocusTrap,
    initGeoDetection,
    initAnalytics,

    // Core access
    manager: _manager
  }
}
