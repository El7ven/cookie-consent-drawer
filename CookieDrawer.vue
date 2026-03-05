<template>
  <!-- Backdrop with opacity animation -->
  <Transition name="backdrop-fade" appear>
    <div
      v-if="isVisible"
      class="cookie-drawer__backdrop"
      @click="handleBackdropClick"
    ></div>
  </Transition>

  <!-- Drawer with slide animation -->
  <Transition :name="drawerAnimation" appear>
    <div
      v-if="isVisible"
      class="cookie-drawer__content-wrapper"
      :class="drawerClasses"
    >
      <div class="cookie-drawer__content" @click.stop>
        <!-- Header -->
        <div class="cookie-drawer__header">
          <h2 class="cookie-drawer__title">
            {{ isSettingsMode 
              ? config.texts.settings.title 
              : (config.mode === 'essential' 
                ? config.texts.essential.title 
                : config.texts.gdpr.title) 
            }}
          </h2>
          <button
            v-if="isSettingsMode"
            @click="handleClose"
            class="cookie-drawer__close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <!-- Banner Mode Content -->
        <div v-if="!isSettingsMode" class="cookie-drawer__banner">
          <!-- Essential Mode - Simple text and button -->
          <div v-if="config.mode === 'essential'" class="cookie-drawer__essential">
            <!-- Message -->
            <div class="cookie-drawer__message">
              {{ config.texts.essential.message }}
            </div>

            <!-- Single Accept Button -->
            <div class="cookie-drawer__actions">
              <button
                @click="handleAcceptAll"
                class="cookie-drawer__button cookie-drawer__button--primary"
              >
                {{ config.texts.essential.button }}
              </button>
            </div>
          </div>

          <!-- GDPR Mode - Full interface -->
          <div v-else class="cookie-drawer__gdpr">
            <!-- Message -->
            <div class="cookie-drawer__message">
              {{ config.texts.gdpr.message }}
            </div>

            <!-- Categories -->
            <div class="cookie-drawer__categories">
              <div
                v-for="category in enabledCategories"
                :key="category.id"
                class="cookie-drawer__category"
              >
                <div class="cookie-drawer__category-header">
                  <span class="cookie-drawer__category-name">
                    {{ category.label }}
                  </span>
                  <div class="cookie-drawer__toggle">
                    <input
                      type="checkbox"
                      :id="`drawer-category-${category.id}`"
                      :checked="categories[category.id]"
                      @change="toggleCategory(category.id)"
                      :disabled="category.locked"
                      class="cookie-drawer__toggle-input"
                    />
                    <label
                      :for="`drawer-category-${category.id}`"
                      :class="[
                        'cookie-drawer__toggle-label',
                        { 'cookie-drawer__toggle-label--disabled': category.locked }
                      ]"
                    ></label>
                  </div>
                </div>
                <div class="cookie-drawer__category-description">
                  {{ category.description }}
                </div>
              </div>
            </div>

            <!-- Settings Link -->
            <div class="cookie-drawer__settings-link">
              <button
                @click="openSettings"
                class="cookie-drawer__settings-button"
              >
                {{ config.texts.gdpr.buttons.settings }}
              </button>
            </div>

            <!-- Action Buttons -->
            <div class="cookie-drawer__actions">
              <button
                @click="handleAcceptSelection"
                class="cookie-drawer__button cookie-drawer__button--secondary"
                :disabled="!canAcceptSelection"
              >
                {{ config.texts.gdpr.buttons.acceptSelection }}
              </button>
              <button
                @click="handleRejectAll"
                class="cookie-drawer__button cookie-drawer__button--secondary"
              >
                {{ config.texts.gdpr.buttons.rejectAll }}
              </button>
              <button
                @click="handleAcceptAll"
                class="cookie-drawer__button cookie-drawer__button--primary"
              >
                {{ config.texts.gdpr.buttons.acceptAll }}
              </button>
            </div>
          </div>
        </div>

        <!-- Settings Mode Content -->
        <div v-else class="cookie-drawer__settings">
          <!-- Tabs -->
          <div class="cookie-drawer__tabs">
            <button
              v-for="tab in availableTabs"
              :key="tab.id"
              @click="selectTab(tab.id)"
              :class="[
                'cookie-drawer__tab',
                { 'cookie-drawer__tab--active': currentTab === tab.id }
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="cookie-drawer__tab-content">
            <!-- Privacy Tab -->
            <div v-if="currentTab === 'privacy'" class="cookie-drawer__privacy">
              <div class="cookie-drawer__privacy-content">
                <p>
                  Acest site folosește cookie-uri pentru a-ți asigura cea mai bună experiență.
                  Cookie-urile sunt fișiere mice de text stocate în browserul tău care ne ajută
                  să facem site-ul mai eficient și mai relevant pentru tine.
                </p>
                <p>
                  Ai control asupra cookie-urilor pe care le permiți. Poți schimba preferințele
                  tale oricând folosind panoul de setări.
                </p>
                <a href="#" class="cookie-drawer__link">
                  {{ config.texts.settings.links.moreInfo }}
                </a>
              </div>
            </div>

            <!-- Category Tabs -->
            <div v-else class="cookie-drawer__category">
              <div class="cookie-drawer__category-header">
                <h4 class="cookie-drawer__category-title">
                  {{ currentCategoryData.label }}
                </h4>
                <div class="cookie-drawer__toggle">
                  <input
                    type="checkbox"
                    :id="`settings-category-${currentTab}`"
                    :checked="categories[currentTab]"
                    @change="toggleCategory(currentTab)"
                    :disabled="currentCategoryData.locked"
                    class="cookie-drawer__toggle-input"
                  />
                  <label
                    :for="`settings-category-${currentTab}`"
                    :class="[
                      'cookie-drawer__toggle-label',
                      { 'cookie-drawer__toggle-label--disabled': currentCategoryData.locked }
                    ]"
                  ></label>
                </div>
              </div>
              <div class="cookie-drawer__category-description">
                {{ currentCategoryData.description }}
              </div>
              <a href="#" class="cookie-drawer__link">
                {{ config.texts.settings.links.cookieDetails }}
              </a>
            </div>
          </div>

          <!-- Settings Actions -->
          <div class="cookie-drawer__actions">
            <button
              @click="handleRejectAll"
              class="cookie-drawer__button cookie-drawer__button--secondary"
            >
              {{ config.texts.settings.buttons.rejectAll }}
            </button>
            <button
              @click="handleAcceptSelection"
              class="cookie-drawer__button cookie-drawer__button--primary"
              :disabled="!canAcceptSelection"
            >
              {{ config.texts.settings.buttons.acceptSelection }}
            </button>
            <button
              @click="handleAcceptAll"
              class="cookie-drawer__button cookie-drawer__button--primary"
            >
              {{ config.texts.settings.buttons.acceptAll }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  isVisible: { type: Boolean, required: true },
  isSettingsMode: { type: Boolean, default: false },
  currentTab: { type: String, required: true },
  categories: { type: Object, required: true },
  config: { type: Object, required: true },
  canAcceptSelection: { type: Boolean, required: true }
})

const emit = defineEmits([
  'close',
  'openSettings',
  'selectTab',
  'toggleCategory',
  'acceptSelection',
  'acceptAll',
  'rejectAll'
])

// Computed properties
const enabledCategories = computed(() => {
  return Object.keys(props.config.categories)
    .filter(catId => props.config.categories[catId].enabled)
    .map(catId => props.config.categories[catId])
})

const availableTabs = computed(() => {
  const tabs = [
    { id: 'privacy', label: props.config.texts.settings.tabs.privacy }
  ]

  Object.keys(props.config.categories).forEach(categoryId => {
    if (props.config.categories[categoryId].enabled) {
      tabs.push({
        id: categoryId,
        label: props.config.categories[categoryId].label
      })
    }
  })

  return tabs
})

const currentCategoryData = computed(() => {
  return props.config.categories[props.currentTab] || {}
})

// Drawer classes and animations
const drawerClasses = computed(() => {
  const isMobile = window.innerWidth <= 768

  return {
    // Always use right-top positioning for desktop
    'cookie-drawer--mobile': isMobile
  }
})

const drawerAnimation = computed(() => {
  const isMobile = window.innerWidth <= 768

  if (isMobile) {
    return 'drawer-slide-up'
  }

  // Always use slide-right for desktop (from right side)
  return 'drawer-slide-right'
})

// Event handlers
const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  emit('close')
}

const openSettings = () => {
  emit('openSettings')
}

const selectTab = (tabId) => {
  emit('selectTab', tabId)
}

const toggleCategory = (categoryId) => {
  emit('toggleCategory', categoryId)
}

const handleAcceptSelection = () => {
  emit('acceptSelection')
}

const handleAcceptAll = () => {
  emit('acceptAll')
}

const handleRejectAll = () => {
  emit('rejectAll')
}
</script>

<style lang="scss" scoped>
// Backdrop styles
.cookie-drawer__backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10000;
}

// Drawer wrapper for positioning
.cookie-drawer__content-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10001;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 20px;
  pointer-events: none;

  // Mobile always bottom
  &--mobile {
    align-items: flex-end;
    justify-content: center;
    padding: 0;
  }
}

.cookie-drawer__content {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  // Mobile sizing
  .cookie-drawer--mobile & {
    max-width: 100%;
    height: 80vh;
    max-height: 600px;
    border-radius: 20px 20px 0 0;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    height: 80vh;
    max-height: 600px;
    border-radius: 20px 20px 0 0;
  }
}

.cookie-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.cookie-drawer__title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.cookie-drawer__close {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
}

.cookie-drawer__banner {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.cookie-drawer__message {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.cookie-drawer__categories {
  margin-bottom: 20px;
}

.cookie-drawer__category {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.cookie-drawer__category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.cookie-drawer__category-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.cookie-drawer__category-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.cookie-drawer__settings-link {
  margin-bottom: 20px;
}

.cookie-drawer__settings-button {
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  font-size: 14px;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #0056b3;
  }
}

.cookie-drawer__actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px;
  }
}

.cookie-drawer__button {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }

  &--primary {
    background: #007bff;
    color: white;
    border-color: #007bff;

    &:hover:not(:disabled) {
      background: #0056b3;
      border-color: #0056b3;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &--secondary {
    background: #6c757d;
    color: white;
    border-color: #6c757d;

    &:hover {
      background: #545b62;
      border-color: #545b62;
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: translateY(0);
  }
}

// Settings specific styles
.cookie-drawer__settings {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cookie-drawer__tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
}

.cookie-drawer__tab {
  background: none;
  border: none;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all 0.2s ease;

  &--active {
    color: #007bff;
    border-bottom-color: #007bff;
  }

  &:hover:not(.--active) {
    color: #333;
    background: #f8f9fa;
  }
}

.cookie-drawer__tab-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.cookie-drawer__privacy {
  line-height: 1.6;

  p {
    margin-bottom: 16px;
    color: #666;
  }
}

.cookie-drawer__link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
}

.cookie-drawer__category-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

// Toggle styles
.cookie-drawer__toggle {
  position: relative;
  width: 48px;
  height: 24px;
}

.cookie-drawer__toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.cookie-drawer__toggle-input:checked + .cookie-drawer__toggle-label {
  background: #007bff;
}

.cookie-drawer__toggle-input:checked + .cookie-drawer__toggle-label::after {
  transform: translateX(24px);
}

.cookie-drawer__toggle-input:disabled + .cookie-drawer__toggle-label {
  opacity: 0.6;
  cursor: not-allowed;
}

.cookie-drawer__toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ccc;
  transition: 0.3s;
  border-radius: 24px;

  &::after {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    left: 3px;
    bottom: 3px;
    background: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  &--disabled {
    cursor: not-allowed;
  }
}

// Drawer animations
.drawer-slide-right-enter-active,
.drawer-slide-right-leave-active {
  transition: all 0.3s ease;
}

.drawer-slide-right-enter-from {
  transform: translateX(100%);
}

.drawer-slide-right-leave-to {
  transform: translateX(100%);
}

.drawer-slide-left-enter-active,
.drawer-slide-left-leave-active {
  transition: all 0.3s ease;
}

.drawer-slide-left-enter-from {
  transform: translateX(-100%);
}

.drawer-slide-left-leave-to {
  transform: translateX(-100%);
}

.drawer-slide-up-enter-active,
.drawer-slide-up-leave-active {
  transition: all 0.3s ease;
}

.drawer-slide-up-enter-from {
  transform: translateY(100%);
}

.drawer-slide-up-leave-to {
  transform: translateY(100%);
}

.drawer-slide-down-enter-active,
.drawer-slide-down-leave-active {
  transition: all 0.3s ease;
}

.drawer-slide-down-enter-from {
  transform: translateY(-100%);
}

.drawer-slide-down-leave-to {
  transform: translateY(-100%);
}

// Backdrop animations
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}
</style>
