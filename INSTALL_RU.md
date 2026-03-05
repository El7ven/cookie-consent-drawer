# 🍪 Cookie Consent Drawer - Инструкция по подключению

Современный, переиспользуемый модуль управления cookie consent с unified drawer интерфейсом для Vue 3 проектов.

## ✨ Особенности

- 🎨 **Unified Drawer** - один компонент для banner и settings
- 📱 **Адаптивный дизайн** - Desktop slide + Mobile bottom sheet  
- 🔄 **Privacy by Default** - только необходимые cookie включены
- 🚀 **Универсальная установка** - для любого Vue 3 проекта
- 🎯 **Backward Compatible** - миграция со старых систем
- 🎪 **Отдельное приложение** - без конфликтов с основным Vue app

## 🚀 Быстрый старт

### 1. Копирование модуля

```bash
# Скопировать папку с модулем
cp -r cookie-consent /path/to/your-project/src/components/
```

### 2. HTML разметка

**ВАЖНО:** Mount point должен быть ВНЕ основного приложения `#app`

```html
<!-- В вашем layout файле -->
<body>
  <!-- Основное приложение -->
  <div id="app">
    <!-- Ваш контент -->
  </div>

  <!-- Cookie Consent Mount Point (ВАЖНО: вне #app!) -->
  <div id="cookie-consent-mount"></div>
</body>
```

### 3. Установка в JavaScript

#### **Метод 1: Авто-инициализация (рекомендуется)**

```javascript
// В вашем main.js или app.js
import { autoInitCookieDrawer } from './components/cookie-consent/helper.js'

// После создания Vue приложения
const app = createApp({...})
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// Инициализация Cookie Consent
autoInitCookieDrawer(app, pinia, {
  debug: false, // true для отладки
  componentName: 'cookie-consent'
})
```

#### **Метод 2: Vue Plugin**

```javascript
import { CookieDrawerPlugin } from './components/cookie-consent/helper.js'

const app = createApp({...})
app.use(CookieDrawerPlugin, {
  componentName: 'cookie-consent',
  autoMount: true
})

// После монтирования основного приложения
const pinia = createPinia()
app.use(pinia)
app.mount('#app')

// Инициализация
app.config.globalProperties.$cookieDrawer.init(pinia)
```

#### **Метод 3: Ручная установка**

```javascript
import { initCookieDrawer } from './components/cookie-consent/helper.js'

const app = createApp({...})
const pinia = createPinia()

// Инициализация с настройками
const { component, config, methods } = initCookieDrawer(app, pinia, {
  debug: true,
  customConfig: {
    mode: 'gdpr',
    display: {
      position: 'top-right',
      animation: 'slide'
    }
  }
})
```

## ⚙️ Конфигурация

### Базовые настройки

```javascript
autoInitCookieDrawer(app, pinia, {
  // Имя компонента
  componentName: 'cookie-consent',
  
  // Селектор mount point
  mountSelector: '#cookie-consent-mount',
  
  // Авто-монтирование
  autoMount: true,
  
  // Кастомная конфигурация
  customConfig: {
    mode: 'gdpr', // 'gdpr' | 'essential'
    storageKey: 'cookie_consent',
    version: '1.0.0'
  },
  
  // Функция перевода
  translator: (key) => translations[key],
  
  // Режим отладки
  debug: false
})
```

### Полная конфигурация

```javascript
const config = {
  // Версия формата данных
  version: '1.0.0',
  
  // Ключ для localStorage
  storageKey: 'cookie_consent',
  
  // Режим работы
  mode: 'gdpr', // 'gdpr' | 'essential'
  
  // Категории cookie
  categories: {
    necessary: {
      name: 'Necessary',
      description: 'Required for the site to function',
      required: true,
      enabled: true
    },
    analytics: {
      name: 'Analytics',
      description: 'Help us improve the site',
      required: false,
      enabled: false
    },
    marketing: {
      name: 'Marketing', 
      description: 'Used for advertising',
      required: false,
      enabled: false
    },
    preferences: {
      name: 'Preferences',
      description: 'Remember your settings',
      required: false,
      enabled: false
    }
  },
  
  // Настройки отображения
  display: {
    position: 'top-right', // 'top-right' | 'top-left'
    animation: 'slide', // 'slide' | 'fade'
    delay: 1000, // задержка перед показом
    autoHide: false // авто-скрытие после выбора
  },
  
  // Тексты
  texts: {
    title: 'Cookie Preferences',
    description: 'We use cookies to enhance your experience...',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    acceptSelection: 'Accept Selection',
    settings: 'Cookie Settings',
    close: 'Close'
  }
}
```

## 🎨 Стилизация

### CSS переменные

```css
:root {
  --cookie-drawer-backdrop: rgba(0, 0, 0, 0.4);
  --cookie-drawer-bg: #ffffff;
  --cookie-drawer-text: #333333;
  --cookie-drawer-border: #e0e0e0;
  --cookie-drawer-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  --cookie-drawer-z-index: 9999;
}
```

### Кастомные стили

```css
/* Переопределение стилей */
.cookie-drawer__content-wrapper {
  border-radius: 12px;
  box-shadow: var(--cookie-drawer-shadow);
}

.cookie-drawer__backdrop {
  backdrop-filter: blur(4px);
}

/* Мобильная версия */
@media (max-width: 768px) {
  .cookie-drawer__content-wrapper {
    border-radius: 20px 20px 0 0;
  }
}
```

## 🔧 API и методы

### Helper методы

```javascript
const { methods } = initCookieDrawer(app, pinia)

// Проверить consent
methods.hasConsent() // boolean
methods.hasCategoryConsent('analytics') // boolean

// Управление
methods.clearConsent() // очистить все
methods.resetConsent() // показать drawer снова
methods.getConsentData() // получить данные
```

### Утилиты

```javascript
import { 
  hasConsent,
  hasCategoryConsent, 
  acceptAllCookies,
  rejectAllCookies,
  clearCookieConsent 
} from './components/cookie-consent/utils.js'

// Проверить consent
if (hasConsent()) {
  // Пользователь дал согласие
}

// Проверить категорию
if (hasCategoryConsent('analytics')) {
  // Включена аналитика
}

// Принять все cookie
acceptAllCookies()

// Отклонить все
rejectAllCookies()
```

### События

```javascript
// Слушать изменения consent
window.addEventListener('cookieConsentChanged', (event) => {
  const { consent, categories } = event.detail
  
  console.log('Consent changed:', consent)
  console.log('Categories:', categories)
  
  // Запустить Google Analytics если согласие дано
  if (categories.analytics) {
    initGoogleAnalytics()
  }
})
```

## 🔄 Миграция со старых систем

### Автоматическая миграция

Модуль автоматически обнаружит и мигрирует старые данные:

```javascript
// Старый формат (будет мигрирован автоматически)
localStorage.setItem('cookies_consent', JSON.stringify({
  expiresAt: Date.now() + 86400000 * 365,
  analytics: true,
  marketing: false
}))

// Новый формат (создан автоматически)
localStorage.setItem('cookie_consent', JSON.stringify({
  version: '1.0.0',
  timestamp: Date.now(),
  hasConsented: true,
  categories: {
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: false
  }
}))
```

### Ручная миграция

```javascript
import { initCookieDrawer } from './components/cookie-consent/helper.js'

const { status } = initCookieDrawer(app, pinia, {
  legacyStorageKey: 'old_cookies_key',
  showLegacyModal: true,
  useModalStore: (pinia) => useModalStore(pinia),
  translator: (key) => translations[key]
})

console.log('Migration status:', status) // 'migrated' | 'ready' | 'already-consented'
```

## 📱 Адаптивное поведение

### Desktop (>768px)
- **Позиция:** top-right или top-left
- **Анимация:** slide-in от стороны
- **Отступы:** 20px от краев
- **Высота:** автоматическая по контенту

### Mobile (≤768px)
- **Позиция:** bottom sheet
- **Анимация:** slide-up от низа
- **Отступы:** 0px (во всю ширину)
- **Высота:** 80% экрана максимум

## 🐛 Отладка

### Включение debug режима

```javascript
autoInitCookieDrawer(app, pinia, {
  debug: true // Показывать все логи в консоли
})
```

### Debug сообщения

```
[CookieDrawer] Auto-init starting...
[CookieDrawer] Mount point found, proceeding with initialization...
[CookieDrawer] Current consent in storage: null
[CookieDrawer] No consent found - drawer should appear
[CookieDrawer] Component initialized
[CookieDrawer] Is visible: true
[CookieDrawer] Initialization completed: ready
```

### Проверка в консоли

```javascript
// Проверить элементы
document.querySelector('.cookie-drawer__backdrop')
document.querySelector('.cookie-drawer__content-wrapper')

// Проверить consent
localStorage.getItem('cookie_consent')

// Проверить состояние
document.body.style.overflow // 'hidden' когда открыт
```

## 📁 Структура файлов

```
cookie-consent/
├── 📄 INSTALL_RU.md         # Эта инструкция
├── 📄 README.md              # Английская документация
├── 🎯 CookieConsent.vue       # Основной компонент
├── 🎨 CookieDrawer.vue        # Unified Drawer
├── 🔧 useCookieConsent.js    # Composable с логикой
├── ⚙️ config.js             # Конфигурация
├── 🛠️ utils.js              # Утилиты и менеджер
├── 🚀 install.js            # Установщики
├── 📦 helper.js             # Helper функции
└── 📋 index.js              # Экспорты модуля
```

## 🌍 Поддержка браузеров

- ✅ Chrome 88+
- ✅ Firefox 78+  
- ✅ Safari 14+
- ✅ Edge 88+
- ✅ iOS Safari 14+
- ✅ Android Chrome 88+

## 📄 Лицензия

MIT License - можно использовать в коммерческих проектах

## 🎉 Готово к использованию!

Модуль полностью готов к production использованию в любых Vue 3 проектах! 🚀

---

## 📋 Чек-лист перед использованием

- [ ] Скопирована папка `cookie-consent` в проект
- [ ] Добавлен mount point `<div id="cookie-consent-mount"></div>`
- [ ] Mount point находится ВНЕ `#app` элемента
- [ ] Подключен импорт `autoInitCookieDrawer`
- [ ] Вызвана функция `autoInitCookieDrawer(app, pinia)`
- [ ] Проверено что drawer появляется на странице
- [ ] Настроены категории cookie под проект
- [ ] Добавлены стили если нужна кастомизация

## 🔗 Полезные ссылки

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [GDPR Cookie Guidelines](https://gdpr.eu/cookies/)
