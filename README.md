# Cookie Consent Module - Universal & Reusable

A comprehensive, standalone Cookie Consent module with unified Drawer architecture. Can be easily reused across different projects.

## Features

- **Unified Drawer**: Single component for banner and settings modes
- **Adaptive UI**: Desktop slide + Mobile bottom sheet
- **Privacy by Default**: Only required cookies enabled initially
- **Configurable Categories**: Necessary, Analytics, Marketing, Preferences
- **Responsive Design**: Mobile and desktop optimized
- **Body Scroll Lock**: Proper modal behavior
- **Version Control**: Automatic re-consent on version changes
- **Event System**: Custom events for integration
- **Cross-Project Ready**: Universal installation helpers

## Quick Start

### Method 1: Plugin Installation (Recommended)

```javascript
// main.js
import { createApp } from 'vue'
import { CookieConsentPlugin } from '@/components/cookie-consent'
import App from './App.vue'

const app = createApp(App)

// Install as plugin
app.use(CookieConsentPlugin, {
  componentName: 'cookie-consent',
  autoMount: true,
  mountSelector: '#cookie-consent-mount'
})

app.mount('#app')
```

### Method 2: Manual Installation

```javascript
// main.js
import { createApp } from 'vue'
import { installCookieConsent } from '@/components/cookie-consent'
import App from './App.vue'

const app = createApp(App)

// Install manually
const { component, config } = installCookieConsent(app, {
  componentName: 'cookie-consent'
})

app.mount('#app')
```

### Method 3: Component Import

```vue
<template>
  <div id="app">
    <!-- Your app content -->
    <CookieConsent />
  </div>
</template>

<script setup>
import { CookieConsent } from '@/components/cookie-consent'
</script>
```

## Cross-Project Usage

### Installation in Different Projects

```javascript
// Any Vue 3 project
import { initCookieConsent } from './path/to/cookie-consent'

const app = createApp(App)
const pinia = createPinia()

// Initialize with backward compatibility
const { component, config, status } = initCookieConsent(app, pinia, {
  // Legacy support options
  legacyStorageKey: 'old_cookies_key',
  showLegacyModal: true,
  legacyDelay: 3000,
  useModalStore: (pinia) => useModalStore(pinia),
  translator: (key) => translate(key)
})

app.use(pinia)
app.mount('#app')
```

### Package Structure for Distribution

```
cookie-consent/
├── dist/                     # Built files for distribution
├── src/                      # Source files
│   ├── CookieConsent.vue
│   ├── CookieDrawer.vue
│   ├── useCookieConsent.js
│   ├── utils.js
│   ├── config.js
│   ├── install.js
│   └── index.js
├── package.json              # Package configuration
└── README.md                 # Documentation
```

## Configuration

### Basic Configuration

```javascript
import { COOKIE_CONSENT_CONFIG } from '@/components/cookie-consent'

const customConfig = {
  ...COOKIE_CONSENT_CONFIG,
  mode: 'gdpr',
  categories: {
    necessary: {
      id: 'necessary',
      label: 'Necesare',
      required: true,
      locked: true
    },
    analytics: {
      id: 'analytics',
      label: 'Statistice',
      required: false,
      enabled: true
    },
    marketing: {
      id: 'marketing',
      label: 'Marketing',
      required: false,
      enabled: false
    }
  },
  display: {
    position: 'top-right',
    animation: 'slide',
    delay: 1000
  }
}
```

### Custom Installation Options

```javascript
// Plugin options
app.use(CookieConsentPlugin, {
  componentName: 'cookie-consent',     // Custom component name
  autoMount: true,                     // Auto-mount to DOM
  mountSelector: '#cookie-mount',      // DOM selector for mounting
  customConfig: {                      // Custom configuration
    ...COOKIE_CONSENT_CONFIG,
    mode: 'essential'
  }
})
```

## API Reference

### Components

```javascript
// Main container component
import { CookieConsent } from '@/components/cookie-consent'

// Unified drawer component
import { CookieDrawer } from '@/components/cookie-consent'
```

### Composables

```javascript
import { useCookieConsent } from '@/components/cookie-consent'

const {
  isVisible,           // Drawer visibility
  showSettings,         // Settings mode
  currentTab,          // Active settings tab
  categories,         // Category states
  consent,             // Consent data
  mode,                // Current mode (essential/gdpr)
  acceptAll,           // Accept all categories
  rejectAll,           // Reject all (except required)
  acceptSelection,     // Accept selected categories
  openSettings,        // Open settings mode
  closeSettings,       // Close settings mode
  selectTab,           // Select settings tab
  toggleCategory,      // Toggle category
  resetConsent         // Reset all consent
} = useCookieConsent(config)
```

### Utilities

```javascript
import { 
  hasConsent,              // Check if user has consented
  hasCategoryConsent,      // Check specific category
  acceptAllCookies,        // Accept all cookies
  rejectAllCookies,        // Reject all cookies
  clearCookieConsent       // Clear consent data
} from '@/components/cookie-consent'

// Usage examples
if (hasConsent()) {
  // User has given consent
}

if (hasCategoryConsent('analytics')) {
  // Load analytics scripts
}
```

### Installation Helpers

```javascript
import { 
  installCookieConsent,    // Install component
  initCookieConsent,       // Initialize with legacy support
  CookieConsentPlugin     // Vue plugin
} from '@/components/cookie-consent'
```

## Events

### Consent Events

```javascript
// Listen for consent changes
window.addEventListener('cookieConsentChanged', (event) => {
  const { consent, categories } = event.detail
  console.log('Consent changed:', categories)
})

// Listen for consent cleared
window.addEventListener('cookieConsentCleared', () => {
  console.log('Consent cleared')
})

// Listen for consent closed
window.addEventListener('cookieConsentClosed', () => {
  console.log('Consent UI closed')
})
```

## Integration Examples

### Google Analytics Integration

```javascript
// Load analytics only after consent
window.addEventListener('cookieConsentChanged', (event) => {
  const { categories } = event.detail
  
  if (categories.analytics) {
    // Load Google Analytics
    loadGTag()
    initializeGA()
  }
  
  if (categories.marketing) {
    // Load marketing pixels
    loadFacebookPixel()
    loadGoogleAds()
  }
})

function loadGTag() {
  // Your analytics loading logic
}
```

### Custom Modal Integration

```javascript
// For projects with existing modal systems
const { component, config, status } = initCookieConsent(app, pinia, {
  showLegacyModal: true,
  useModalStore: (pinia) => useYourModalStore(pinia),
  translator: (key) => i18n.global.t(key),
  legacyDelay: 2000
})
```

## Styling & Theming

### CSS Custom Properties

```scss
:root {
  --cookie-drawer-primary-color: #007bff;
  --cookie-drawer-secondary-color: #6c757d;
  --cookie-drawer-border-radius: 12px;
  --cookie-drawer-backdrop-blur: 4px;
  --cookie-drawer-max-width: 900px;
}
```

### Component Styling

```scss
// Override drawer styles
.cookie-drawer__content {
  background: your-custom-bg;
  border-radius: var(--cookie-drawer-border-radius);
}

// Custom toggle styles
.cookie-drawer__toggle-label {
  background: your-custom-color;
}
```

## File Structure

```
cookie-consent/
├── CookieConsent.vue          # Main container component
├── CookieDrawer.vue           # Unified drawer component
├── useCookieConsent.js        # Composable with logic
├── utils.js                   # Utility functions & manager
├── config.js                  # Configuration constants
├── install.js                 # Installation helpers
├── index.js                   # Universal exports
└── README.md                  # Documentation
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Migration from Old Architecture

### From Multiple Components

```javascript
// Old way
import CookieBannerEssential from './CookieBannerEssential.vue'
import CookieBannerGDPR from './CookieBannerGDPR.vue'
import CookieSettingsModal from './CookieSettingsModal.vue'

// New way
import { CookieConsent } from '@/components/cookie-consent'
```

### Legacy Data Migration

The module automatically migrates legacy consent data:

```javascript
// Old format (automatically detected and migrated)
{
  expiresAt: 1234567890,
  analytics: true,
  marketing: false
}

// New format (automatically created)
{
  version: '1.0.0',
  timestamp: 1234567890,
  hasConsented: true,
  categories: {
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: false
  }
}
```

## License

MIT License - feel free to use in commercial projects and distribute across multiple projects.
