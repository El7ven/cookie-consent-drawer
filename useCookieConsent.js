import { ref, computed, onMounted, watch } from 'vue'
import { COOKIE_CONSENT_CONFIG } from './config.js'
import { cookieConsentManager } from './utils.js'

export function useCookieConsent(config = COOKIE_CONSENT_CONFIG) {
  // Normalize categories from array to object
  const normalizedCategories = computed(() => {
    if (Array.isArray(config.categories)) {
      return config.categories.reduce((acc, category) => {
        acc[category.id] = category
        return acc
      }, {})
    }
    return config.categories || {}
  })

  // State
  const isVisible = ref(false)
  const showSettings = ref(false)
  const currentTab = ref('privacy')
  const categories = ref({})
  const consent = ref(null)
  const showDelayTimer = ref(null)
  const autoHideTimer = ref(null)
  
  // Computed
  const mode = computed(() => config.mode)
  const enabledCategories = computed(() => 
    Object.keys(normalizedCategories.value).filter(catId => normalizedCategories.value[catId].enabled)
  )
  
  const requiredCategories = computed(() => 
    Object.keys(normalizedCategories.value).filter(catId => normalizedCategories.value[catId].required)
  )
  
  const selectedCategories = computed(() => 
    Object.keys(categories.value).filter(catId => categories.value[catId])
  )
  
  const canAcceptSelection = computed(() => 
  // Better logic: at least one non-required category is selected
  Object.keys(categories.value).some(catId =>
    !config.categories[catId].required && categories.value[catId]
  )
)
  
  // Script loading functions (SSR safe + prevent duplicates)
  let analyticsLoaded = false
  let marketingLoaded = false
  let preferencesLoaded = false
  
  const loadAnalyticsScripts = () => {
    if (typeof window === 'undefined' || analyticsLoaded) return
    analyticsLoaded = true
  }
  
  const loadMarketingScripts = () => {
    if (typeof window === 'undefined' || marketingLoaded) return
    marketingLoaded = true
  }
  
  const loadPreferenceScripts = () => {
    if (typeof window === 'undefined' || preferencesLoaded) return
    preferencesLoaded = true
  }
  
  // Methods
  const initializeConsent = () => {
    const savedConsent = cookieConsentManager.getConsent()
    
    if (savedConsent) {
      consent.value = savedConsent
      categories.value = { ...savedConsent.categories }
      isVisible.value = false
    } else {
      categories.value = cookieConsentManager.getDefaultCategoriesState()
      showWithDelay()
    }
  }
  
  const showWithDelay = () => {
    if (showDelayTimer.value) {
      clearTimeout(showDelayTimer.value)
    }
    
    const delay = config.display?.delay || 0
    if (delay > 0) {
      showDelayTimer.value = setTimeout(() => {
        isVisible.value = true
        if (typeof window !== 'undefined' && document.body) {
          document.body.style.overflow = 'hidden'
        }
        setupAutoHide()
      }, delay)
    } else {
      isVisible.value = true
      if (typeof window !== 'undefined' && document.body) {
        document.body.style.overflow = 'hidden'
      }
      setupAutoHide()
    }
  }
  
  const setupAutoHide = () => {
    if (autoHideTimer.value) {
      clearTimeout(autoHideTimer.value)
    }
    
    if (config.mode === 'gdpr') {
      return
    }
    
    const autoHide = config.display?.autoHide || 0
    if (autoHide > 0) {
      autoHideTimer.value = setTimeout(() => {
        hideBanner()
      }, autoHide)
    }
  }
  
  const hideBanner = () => {
    isVisible.value = false
    // Unblock body scroll when drawer is completely closed (SSR safe)
    if (typeof window !== 'undefined' && document.body) {
      document.body.style.overflow = ''
    }
    if (autoHideTimer.value) {
      clearTimeout(autoHideTimer.value)
      autoHideTimer.value = null
    }
  }
  
  const acceptAll = () => {
    let result
    
    // Essential mode - only required categories
    if (config.mode === 'essential') {
      const essentialOnly = {}
      Object.keys(config.categories).forEach(key => {
        essentialOnly[key] = config.categories[key].required
      })
      result = cookieConsentManager.saveConsent(essentialOnly)
    } else {
      result = cookieConsentManager.acceptAll()
    }
    
    if (result) {
      consent.value = result
      categories.value = { ...result.categories }
      hideBanner()
      showSettings.value = false
    }
  }
  
  const rejectAll = () => {
    const result = cookieConsentManager.rejectAll()
    if (result) {
      consent.value = result
      categories.value = { ...result.categories }
      hideBanner()
      showSettings.value = false
    }
  }
  
  const acceptSelection = () => {
    if (!canAcceptSelection.value) return
    
    const result = cookieConsentManager.acceptSelected(selectedCategories.value)
    if (result) {
      consent.value = result
      categories.value = { ...result.categories }
      hideBanner()
      showSettings.value = false
    }
  }
  
  const openSettings = () => {
    showSettings.value = true
    currentTab.value = 'privacy'
    if (autoHideTimer.value) {
      clearTimeout(autoHideTimer.value)
    }
    if (typeof window !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden'
    }
  }
  
  const closeSettings = () => {
    showSettings.value = false
    if (consent.value?.hasConsented) {
      isVisible.value = false
      if (typeof window !== 'undefined' && document.body) {
        document.body.style.overflow = ''
      }
    } else {
      setupAutoHide()
    }
  }
  
  const closeBanner = () => {
    hideBanner()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentClosed'))
    }
  }
  
  const selectTab = (tabId) => {
    currentTab.value = tabId
  }
  
  const toggleCategory = (categoryId) => {
    const category = config.categories[categoryId]
    if (category.locked) return
    
    categories.value[categoryId] = !categories.value[categoryId]
  }
  
  const resetConsent = () => {
    cookieConsentManager.clearConsent()
    
    if (showDelayTimer.value) {
      clearTimeout(showDelayTimer.value)
    }
    if (autoHideTimer.value) {
      clearTimeout(autoHideTimer.value)
    }
    
    categories.value = cookieConsentManager.getDefaultCategoriesState()
    consent.value = null
    
    showWithDelay()
  }
  
  // Event listeners
  const handleConsentChanged = (event) => {
    consent.value = event.detail.consent
    categories.value = { ...event.detail.categories }
  }
  
  // Lifecycle
  onMounted(() => {
    initializeConsent()
    if (typeof window !== 'undefined') {
      window.addEventListener('cookieConsentChanged', handleConsentChanged)
    }
  })
  
  // Cleanup
  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('cookieConsentChanged', handleConsentChanged)
    }
    if (showDelayTimer.value) {
      clearTimeout(showDelayTimer.value)
    }
    if (autoHideTimer.value) {
      clearTimeout(autoHideTimer.value)
    }
    if (typeof window !== 'undefined' && document.body) {
      document.body.style.overflow = ''
    }
  }
  
  watch(consent, (newConsent) => {
    if (!newConsent) return
    
    if (typeof window !== 'undefined') {
      if (newConsent.categories.analytics) {
        loadAnalyticsScripts()
      }
      if (newConsent.categories.marketing) {
        loadMarketingScripts()
      }
      if (newConsent.categories.preferences) {
        loadPreferenceScripts()
      }
    }
  })
  
  watch(() => config.mode, initializeConsent)
  
  return {
    // State
    isVisible,
    showSettings,
    currentTab,
    categories,
    consent,
    
    // Computed
    mode,
    enabledCategories,
    requiredCategories,
    selectedCategories,
    canAcceptSelection,
    
    // Methods
    acceptAll,
    rejectAll,
    acceptSelection,
    openSettings,
    closeSettings,
    closeBanner,
    selectTab,
    toggleCategory,
    resetConsent,
    showWithDelay,
    hideBanner,
    cleanup,
    
    // Config access
    config
  }
}
