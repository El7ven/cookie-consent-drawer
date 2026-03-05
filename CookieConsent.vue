<template>
  <div class="cookie-consent">
    <!-- Cookie Drawer (Unified Component) -->
    <CookieDrawer
      :is-visible="isVisible"
      :is-settings-mode="showSettings"
      :current-tab="currentTab"
      :categories="categories"
      :config="config"
      :can-accept-selection="canAcceptSelection"
      @close="handleClose"
      @open-settings="handleOpenSettings"
      @select-tab="handleSelectTab"
      @toggle-category="handleToggleCategory"
      @accept-selection="handleAcceptSelection"
      @accept-all="handleAcceptAll"
      @reject-all="handleRejectAll"
    />
  </div>
</template>

<script setup>
import { onUnmounted, watch } from 'vue'
import { useCookieConsent } from './useCookieConsent.js'
import { COOKIE_CONSENT_CONFIG } from './config.js'
import CookieDrawer from './CookieDrawer.vue'

// Props for customization
const props = defineProps({
  config: {
    type: Object,
    default: () => COOKIE_CONSENT_CONFIG
  }
})

// Use the composable
const {
  isVisible,
  showSettings,
  currentTab,
  categories,
  mode,
  canAcceptSelection,
  acceptAll,
  rejectAll,
  acceptSelection,
  openSettings,
  closeSettings,
  selectTab,
  toggleCategory,
  cleanup
} = useCookieConsent(props.config)

// Debug logging (only in debug mode)
if (props.config.debug) {
    console.log('[CookieConsent] Component initialized')
    console.log('[CookieConsent] Is visible:', isVisible.value)
    console.log('[CookieConsent] Mode:', mode.value)

    // Watch visibility changes
    if (typeof window !== 'undefined') {
        const unwatch = isVisible.value ? null : watch(isVisible, (newValue) => {
            console.log('[CookieConsent] Visibility changed:', newValue)
        })
    }
}

// Event handlers
const handleAcceptAll = () => {
  acceptAll()
}

const handleRejectAll = () => {
  rejectAll()
}

const handleAcceptSelection = () => {
  acceptSelection()
}

const handleOpenSettings = () => {
  openSettings()
}

const handleSelectTab = (tabId) => {
  selectTab(tabId)
}

const handleToggleCategory = (categoryId) => {
  toggleCategory(categoryId)
}

const handleClose = () => {
  if (showSettings.value) {
    closeSettings()
  } else {
    // Close banner/drawer
    if (mode.value === 'essential') {
      acceptAll() // For essential mode, accept all
    } else {
      // For GDPR mode, we can close without consent or handle differently
      closeSettings()
    }
  }
}

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})

// Expose methods for external use
defineExpose({
  acceptAll: handleAcceptAll,
  rejectAll: handleRejectAll,
  resetConsent: () => {
    // This would need to be added to the composable
    cleanup()
  }
})
</script>

<style lang="scss" scoped>
.cookie-consent {
  position: relative;

  &--has-modal {
    // Ensure the container can contain the absolute positioned modal
    min-height: 100vh;
  }
}
</style>
