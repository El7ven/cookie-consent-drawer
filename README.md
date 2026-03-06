# @el7ven/cookie-consent-drawer

🍪 Modern, reusable cookie consent drawer module for Vue 3 projects with unified interface

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

### Basic Usage

```vue
<template>
  <div>
    <CookieConsent />
  </div>
</template>

<script setup>
import { CookieConsent } from '@el7ven/cookie-consent-drawer'
</script>
```

### Advanced Configuration

```vue
<template>
  <div>
    <CookieConsent 
      :config="config"
      @consent-given="handleConsent"
    />
  </div>
</template>

<script setup>
import { CookieConsent, useCookieConsent } from '@el7ven/cookie-consent-drawer'

const config = {
  title: 'Privacy Settings',
  description: 'We use cookies to enhance your experience.',
  categories: [
    {
      id: 'necessary',
      title: 'Essential Cookies',
      description: 'Required for the site to function',
      required: true,
      cookies: [
        { name: 'session_id', duration: 'Session' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us improve our services',
      required: false,
      cookies: [
        { name: 'ga_tracking', duration: '2 years' }
      ]
    }
  ]
}

const { hasConsent, acceptAll, rejectAll } = useCookieConsent(config)

const handleConsent = (categories) => {
  console.log('User consent:', categories)
}
</script>
```

## Configuration Options

### Default Config

```javascript
{
  title: 'Cookie Preferences',
  description: 'We use cookies to ensure you get the best experience.',
  privacyPolicyUrl: '/privacy',
  imprintUrl: '/imprint',
  categories: [
    {
      id: 'necessary',
      title: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function.',
      required: true,
      icon: '🔒'
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      required: false,
      icon: '📊'
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      description: 'Used to deliver advertisements that are relevant to you.',
      required: false,
      icon: '🎯'
    }
  ]
}
```

### Custom Styling

The package includes comprehensive CSS that can be customized:

```css
/* Override primary colors */
.cookie-drawer__button--primary {
  background: #your-brand-color;
}

/* Custom animations */
.cookie-drawer__content {
  border-radius: 16px;
}
```

## API Reference

### Components

#### CookieConsent

Main component that handles the cookie consent interface.

**Props:**
- `config` (Object): Configuration object
- `showSettings` (Boolean): Start in settings mode

**Events:**
- `@consent-given`: Fired when user makes consent choice
- `@settings-opened`: Fired when settings panel is opened

#### CookieDrawer

Advanced drawer component for custom implementations.

**Props:**
- `isVisible` (Boolean): Control drawer visibility
- `isSettingsMode` (Boolean): Enable settings mode
- `categories` (Array): Cookie categories configuration
- `config` (Object): UI configuration

### Composables

#### useCookieConsent

```javascript
const {
  isVisible,
  showSettings,
  currentTab,
  categories,
  hasConsent,
  acceptAll,
  rejectAll,
  saveConsent,
  resetConsent
} = useCookieConsent(config)
```

### Utilities

```javascript
import { 
  hasConsent,
  hasCategoryConsent,
  acceptAllCookies,
  rejectAllCookies,
  clearCookieConsent
} from '@el7ven/cookie-consent-drawer'
```

## Plugin Integration

### Vue Plugin

```javascript
// main.js
import { createApp } from 'vue'
import { CookieConsentPlugin } from '@el7ven/cookie-consent-drawer'
import App from './App.vue'

const app = createApp(App)

app.use(CookieConsentPlugin, {
  config: {
    title: 'My App Privacy',
    // ... your config
  },
  autoShow: true
})
```

## Browser Support

- Chrome >= 88
- Firefox >= 78  
- Safari >= 14
- Edge >= 88

## License

MIT © [El7ven](https://github.com/El7ven)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you have any questions or issues, please [open an issue](https://github.com/El7ven/cookie-consent-drawer/issues).
