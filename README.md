# @el7ven/cookie-consent-drawer

![npm version](https://img.shields.io/npm/v/@el7ven/cookie-consent-drawer)
![npm downloads](https://img.shields.io/npm/dm/@el7ven/cookie-consent-drawer)
![license](https://img.shields.io/npm/l/@el7ven/cookie-consent-drawer)
![bundle size](https://img.shields.io/bundlephobia/minzip/@el7ven/cookie-consent-drawer)

🍪 **Enterprise-grade cookie consent library for Vue 3** with Google Consent Mode v2, GDPR/CCPA compliance, and analytics integrations

## ✨ What's New in v2.0

- 🎯 **Google Consent Mode v2** - Automatic gtag integration
- 📜 **Script Loader** - Block/unblock scripts based on consent
- ♿ **WCAG Accessibility** - Focus trap, keyboard navigation, ARIA
- 🌍 **Geo Detection** - Auto GDPR/CCPA based on user location
- 📊 **Analytics Ready** - GA4, GTM, Meta Pixel, TikTok, Hotjar
- 🎨 **Theme System** - CSS variables, dark mode support
- 🔧 **Event System** - Custom events and debug mode
- 🔄 **Backward Compatible** - Works with v1 code

## Why @el7ven/cookie-consent-drawer?

Most cookie consent libraries are either:

- **🎯 Too heavy** - Large bundle sizes that slow down your app
- **🔧 Not Vue-friendly** - Built for vanilla JS, not Vue ecosystem  
- **📱 Poor mobile experience** - Desktop-first design
- **🚫 Not SSR-safe** - Breaks in Nuxt/SSR environments
- **📋 Complex setup** - Dozens of configuration options

**@el7ven/cookie-consent-drawer focuses on:**

✅ **Vue 3 Composition API** - Modern, reactive, type-safe  
✅ **Lightweight bundle** - ~30KB minified  
✅ **Modern drawer UI** - Mobile-first, accessible design  
✅ **Easy customization** - Simple API, sensible defaults  
✅ **SSR-safe architecture** - Works perfectly with Nuxt  
✅ **Production-ready** - Used in enterprise applications

## Features

- **🎨 Modern UI**: Clean, responsive design with smooth animations
- **📱 Mobile First**: Adaptive interface for desktop and mobile
- **🔒 Privacy by Default**: Only essential cookies enabled initially
- **⚙️ Configurable Categories**: Analytics, Marketing, Functional, Preferences
- **🎯 Easy Integration**: Simple setup with Vue 3 Composition API
- **🌙 Dark Mode Support**: Built-in theme switching
- **📦 Lightweight**: Minimal bundle size with tree-shaking support
- **🔧 TypeScript Ready**: Full type definitions included

## Installation

```bash
npm install @el7ven/cookie-consent-drawer
```

## Quick Start

### Basic Usage (v1 API)

```vue
<template>
  <div>
    <CookieConsent />
  </div>
</template>

<script setup>
import { CookieConsent } from '@el7ven/cookie-consent-drawer'
import '@el7ven/cookie-consent-drawer/dist/style.css'
</script>
```

### Advanced Usage (v2 API)

```vue
<template>
  <div>
    <button @click="showSettings">Cookie Settings</button>
  </div>
</template>

<script setup>
import { useCookieConsent } from '@el7ven/cookie-consent-drawer/src/composables/useCookieConsent.js'
import '@el7ven/cookie-consent-drawer/src/themes/default.css'

const config = {
  version: '2.0.0',
  mode: 'gdpr',
  debug: true,
  
  // Google Consent Mode v2
  consentMode: {
    enabled: true,
    waitForUpdate: 500
  },
  
  // Geo detection
  geo: {
    autoDetect: true,
    defaultRegion: 'gdpr'
  },
  
  // Analytics integrations
  analytics: {
    ga4: { GA_ID: 'G-XXXXXXXXXX' },
    gtm: { GTM_ID: 'GTM-XXXXXXX' }
  },
  
  // Categories
  categories: [
    { id: 'necessary', title: 'Essential', required: true },
    { id: 'analytics', title: 'Analytics', required: false },
    { id: 'marketing', title: 'Marketing', required: false }
  ]
}

const { 
  showSettings, 
  hasConsented, 
  consent 
} = useCookieConsent(config)
</script>
```

## Configuration

### Categories

```javascript
categories: [
  {
    id: 'necessary',
    title: 'Essential Cookies',
    description: 'Required for the website to function',
    required: true
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Help us understand how you use our site',
    required: false
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Used to show you relevant ads',
    required: false
  }
]
```

### Google Consent Mode v2

```javascript
import { useCookieConsent } from '@el7ven/cookie-consent-drawer/src/composables/useCookieConsent.js'

const { initConsentMode } = useCookieConsent({
  consentMode: {
    enabled: true,
    waitForUpdate: 500,
    categoryMapping: {
      necessary: ['security_storage'],
      analytics: ['analytics_storage'],
      marketing: ['ad_storage', 'ad_user_data', 'ad_personalization']
    }
  }
})
```

### Script Blocking

Block scripts until user consent:

```html
<!-- This script won't load until analytics consent is granted -->
<script 
  type="text/plain" 
  data-cookiecategory="analytics"
  data-src="https://www.googletagmanager.com/gtag/js?id=GA_ID">
</script>

<script type="text/plain" data-cookiecategory="analytics">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

Or programmatically:

```javascript
const { initScriptLoader } = useCookieConsent()

const loader = initScriptLoader()
loader.register('analytics', 'https://www.google-analytics.com/analytics.js')
loader.register('marketing', 'https://connect.facebook.net/en_US/fbevents.js')
```

### Analytics Integration

```vue
<script setup>
import { useCookieConsent } from '@el7ven/cookie-consent-drawer/src/composables/useCookieConsent.js'

const { initAnalytics } = useCookieConsent({
  analytics: {
    ga4: {
      GA_ID: 'G-XXXXXXXXXX',
      options: { anonymize_ip: true }
    },
    gtm: {
      GTM_ID: 'GTM-XXXXXXX'
    },
    metaPixel: {
      PIXEL_ID: '1234567890'
    },
    tiktokPixel: {
      TIKTOK_ID: 'XXXXXXXXXX'
    },
    hotjar: {
      HOTJAR_ID: '1234567'
    }
  }
})

// Analytics will load/unload automatically based on consent
</script>
```

### Geo Detection

```javascript
const { initGeoDetection, geoResult } = useCookieConsent({
  geo: {
    autoDetect: true,
    defaultRegion: 'gdpr',
    provider: 'auto' // 'auto' | 'ipapi' | 'manual'
  }
})

// Detect user region
await initGeoDetection()

console.log(geoResult.value)
// { country: 'DE', region: 'gdpr', rules: { showBanner: true, ... } }
```

### Theme Customization

```css
:root {
  --cc-primary: #007bff;
  --cc-bg: #ffffff;
  --cc-text: #333333;
  --cc-border-radius: 12px;
}

[data-cc-theme="dark"] {
  --cc-primary: #4da3ff;
  --cc-bg: #1e1e2e;
  --cc-text: #e0e0e0;
}
```

## Nuxt Support

This package is SSR-safe. Use with `<ClientOnly>`:

```vue
<template>
  <div>
    <ClientOnly>
      <CookieConsent />
    </ClientOnly>
  </div>
</template>

<script setup>
import { CookieConsent } from '@el7ven/cookie-consent-drawer'
import '@el7ven/cookie-consent-drawer/dist/style.css'
</script>
```

## API Reference

### useCookieConsent(config)

Main composable for v2 API.

**Returns:**
- `isVisible` - Banner visibility state
- `hasConsented` - Whether user has consented
- `consent` - Current consent state
- `categories` - Category states
- `show()` - Show banner
- `showSettings()` - Show settings
- `acceptAll()` - Accept all categories
- `rejectAll()` - Reject optional categories
- `resetConsent()` - Clear consent

### ConsentManager

Core consent management class.

```javascript
import { ConsentManager } from '@el7ven/cookie-consent-drawer/src/core/ConsentManager.js'

const manager = new ConsentManager({
  version: '2.0.0',
  storageType: 'localStorage', // 'localStorage' | 'cookie' | 'both'
  cookieExpiry: 180, // days
  debug: true
})

manager.acceptAll()
manager.on('consentChanged', ({ consent }) => {
  console.log('Consent updated:', consent)
})
```

### Events

```javascript
// Listen to events
manager.on('consentChanged', (data) => {})
manager.on('categoryChanged', (data) => {})
manager.on('consentCleared', (data) => {})

// Or via DOM
window.addEventListener('cookieConsent:consentChanged', (e) => {
  console.log(e.detail)
})
```

## Accessibility

Built-in WCAG 2.1 compliance:

- ✅ Focus trap within modal
- ✅ Keyboard navigation (Tab, Shift+Tab, Escape)
- ✅ ARIA attributes (`role="dialog"`, `aria-modal="true"`)
- ✅ Screen reader support

```javascript
const { initFocusTrap, activateFocusTrap } = useCookieConsent({
  accessibility: true
})

// Focus trap activates automatically when banner opens
```

## Browser Support

- Chrome >= 88
- Firefox >= 78  
- Safari >= 14
- Edge >= 88

## Migration from v1

v2 is backward compatible. Your v1 code will continue to work:

```javascript
// v1 - still works
import { CookieConsent } from '@el7ven/cookie-consent-drawer'

// v2 - new features
import { useCookieConsent } from '@el7ven/cookie-consent-drawer/src/composables/useCookieConsent.js'
```

## License

MIT © [El7ven](https://github.com/El7ven)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## Support

- 📖 [Documentation](https://github.com/El7ven/cookie-consent-drawer)
- 🐛 [Issue Tracker](https://github.com/El7ven/cookie-consent-drawer/issues)
- 💬 [Discussions](https://github.com/El7ven/cookie-consent-drawer/discussions).
