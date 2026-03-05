# 📦 Публикация npm пакета

## Подготовка к публикации

### 1. Установка зависимостей
```bash
npm install
```

### 2. Сборка пакета
```bash
npm run build
```

### 3. Проверка содержимого
```bash
npm pack --dry-run
```

## Публикация

### 1. Логин в npm
```bash
npm login
```

### 2. Публикация пакета
```bash
npm publish
```

### 3. Публикация с тегом
```bash
npm publish --tag beta
```

## Версионирование

### Обновление версии
```bash
# Patch (1.0.0 → 1.0.1)
npm version patch

# Minor (1.0.0 → 1.1.0)  
npm version minor

# Major (1.0.0 → 2.0.0)
npm version major
```

### Публикация новой версии
```bash
git push origin main --tags
npm publish
```

## Использование пакета

### Установка
```bash
npm install @healthbridge/cookie-consent-drawer
```

### Импорт
```javascript
// ES Modules
import { CookieConsent, autoInitCookieDrawer } from '@healthbridge/cookie-consent-drawer'

// CommonJS
const { CookieConsent, autoInitCookieDrawer } = require('@healthbridge/cookie-consent-drawer')

// Стили
import '@healthbridge/cookie-consent-drawer/style'
```

## Структура дистрибутива

```
dist/
├── index.js          # CommonJS
├── index.esm.js      # ES Modules  
├── index.umd.js      # UMD (для CDN)
├── index.d.ts        # TypeScript типы
└── style.css         # Скомпилированные стили
```

## Проверка публикации

### Просмотр пакета
```bash
npm view @healthbridge/cookie-consent-drawer
```

### Установка локально для тестов
```bash
npm install ./path/to/package.tgz
```
