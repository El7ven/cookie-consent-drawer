<template>
  <div class="cookie-drawer">
    <!-- Backdrop -->
    <div
      v-if="isVisible"
      class="cookie-drawer__backdrop"
      @click="$emit('close')"
    />

    <!-- Main Drawer Content -->
    <transition name="slide-up" appear>
      <div
        v-if="isVisible"
        class="cookie-drawer__content-wrapper"
        :class="{ 'cookie-drawer__content-wrapper--mobile': isMobile }"
      >
        <div
          class="cookie-drawer__content"
          :class="{ 'cookie-drawer__content--mobile': isMobile }"
        >
          <!-- Header -->
          <header
            class="cookie-drawer__header"
            :class="{ 'cookie-drawer__header--mobile': isMobile }"
          >
            <div class="cookie-drawer__header-content">
              <div class="cookie-drawer__logo">🍪</div>
              <h2 class="cookie-drawer__title">{{ config.title }}</h2>
            </div>
            <button
              class="cookie-drawer__close-btn"
              @click="$emit('close')"
              :aria-label="config.closeAriaLabel"
            >
              ×
            </button>
          </header>

          <!-- Tab Navigation -->
          <nav class="cookie-drawer__tabs">
            <button
              class="cookie-drawer__tab"
              :class="{ 'cookie-drawer__tab--active': currentTab === 'intro' }"
              @click="$emit('selectTab', 'intro')"
            >
              {{ config.introTabLabel }}
            </button>
            <button
              class="cookie-drawer__tab"
              :class="{ 'cookie-drawer__tab--active': currentTab === 'categories' }"
              @click="$emit('selectTab', 'categories')"
            >
              {{ config.categoriesTabLabel }}
            </button>
            <button
              class="cookie-drawer__tab"
              :class="{ 'cookie-drawer__tab--active': currentTab === 'about' }"
              @click="$emit('selectTab', 'about')"
            >
              {{ config.aboutTabLabel }}
            </button>
          </nav>

          <!-- Tab Content -->
          <div
            class="cookie-drawer__body"
            :class="{ 'cookie-drawer__body--mobile': isMobile }"
          >
            <!-- Introduction Tab -->
            <div
              class="cookie-drawer__tab-content"
              :class="{ 'cookie-drawer__tab-content--active': currentTab === 'intro' }"
            >
              <div class="cookie-drawer__intro">
                <h3 class="cookie-drawer__intro-title">{{ config.introTitle }}</h3>
                <p class="cookie-drawer__intro-text">{{ config.introText }}</p>
              </div>
            </div>

            <!-- Categories Tab -->
            <div
              class="cookie-drawer__tab-content"
              :class="{ 'cookie-drawer__tab-content--active': currentTab === 'categories' }"
            >
              <div
                v-for="category in categories"
                :key="category.id"
                class="cookie-drawer__category"
              >
                <div class="cookie-drawer__category-header">
                  <div class="cookie-drawer__category-info">
                    <div
                      class="cookie-drawer__category-icon"
                      :class="`cookie-drawer__category-icon--${category.id}`"
                    >
                      {{ category.icon }}
                    </div>
                    <div class="cookie-drawer__category-details">
                      <h4 class="cookie-drawer__category-title">{{ category.title }}</h4>
                      <p class="cookie-drawer__category-description">{{ category.description }}</p>
                    </div>
                  </div>
                  <button
                    class="cookie-drawer__category-toggle"
                    :class="{
                      'cookie-drawer__category-toggle--active': category.enabled,
                      'cookie-drawer__category-toggle--disabled': category.required
                    }"
                    @click="!category.required && $emit('toggleCategory', category.id)"
                    :disabled="category.required"
                    :aria-label="`${category.enabled ? 'Disable' : 'Enable'} ${category.title}`"
                  >
                    <div class="cookie-drawer__toggle-slider" />
                  </button>
                </div>

                <div
                  v-if="category.enabled && category.cookies && category.cookies.length"
                  class="cookie-drawer__category-content"
                >
                  <p class="cookie-drawer__category-description-full">
                    {{ category.detailedDescription }}
                  </p>
                  <ul class="cookie-drawer__cookies-list">
                    <li
                      v-for="cookie in category.cookies"
                      :key="cookie.name"
                      class="cookie-drawer__cookie-item"
                    >
                      <div class="cookie-drawer__cookie-name">{{ cookie.name }}</div>
                      <div class="cookie-drawer__cookie-description">{{ cookie.description }}</div>
                      <div class="cookie-drawer__cookie-duration">Duration: {{ cookie.duration }}</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- About Tab -->
            <div
              class="cookie-drawer__tab-content"
              :class="{ 'cookie-drawer__tab-content--active': currentTab === 'about' }"
            >
              <div class="cookie-drawer__intro">
                <h3 class="cookie-drawer__intro-title">{{ config.aboutTitle }}</h3>
                <p class="cookie-drawer__intro-text">{{ config.aboutText }}</p>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <footer
            class="cookie-drawer__footer"
            :class="{ 'cookie-drawer__footer--mobile': isMobile }"
          >
            <button
              class="cookie-drawer__btn cookie-drawer__btn--outline"
              :class="{ 'cookie-drawer__btn--mobile': isMobile }"
              @click="$emit('rejectAll')"
            >
              {{ config.rejectAllLabel }}
            </button>
            <button
              class="cookie-drawer__btn cookie-drawer__btn--secondary"
              :class="{ 'cookie-drawer__btn--mobile': isMobile }"
              @click="$emit('acceptSelection')"
              :disabled="!canAcceptSelection"
            >
              {{ config.acceptSelectionLabel }}
            </button>
            <button
              class="cookie-drawer__btn cookie-drawer__btn--primary"
              :class="{ 'cookie-drawer__btn--mobile': isMobile }"
              @click="$emit('acceptAll')"
            >
              {{ config.acceptAllLabel }}
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- Simple Banner (for non-modal mode) -->
    <div
      v-if="!isSettingsMode && isVisible && isMobile"
      class="cookie-drawer__banner"
    >
      <div class="cookie-drawer__banner-content">
        <div class="cookie-drawer__banner-text">
          {{ config.bannerText }}
        </div>
        <div class="cookie-drawer__banner-actions">
          <button
            class="cookie-drawer__btn cookie-drawer__btn--outline"
            @click="$emit('openSettings')"
          >
            {{ config.settingsLabel }}
          </button>
          <button
            class="cookie-drawer__btn cookie-drawer__btn--primary"
            @click="$emit('acceptAll')"
          >
            {{ config.acceptAllLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'CookieDrawer',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    isSettingsMode: {
      type: Boolean,
      default: false
    },
    currentTab: {
      type: String,
      default: 'intro'
    },
    categories: {
      type: Array,
      required: true
    },
    config: {
      type: Object,
      required: true
    },
    canAcceptSelection: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'close',
    'openSettings',
    'selectTab',
    'toggleCategory',
    'acceptSelection',
    'acceptAll',
    'rejectAll'
  ],
  setup(props) {
    const isMobile = ref(false)

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })

    return {
      isMobile
    }
  }
}
</script>

<style scoped>
/* Styles will be added later */
</style>
