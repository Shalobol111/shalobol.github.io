# 📬 ARB TECH — Современный одностраничный сайт с формой обратной связи и интеграцией Telegram

Современный, адаптивный и доступный одностраничный сайт с полностью функциональной формой обратной связи. Готов к запуску на localhost без необходимости настройки сборщиков. **Включает интеграцию с Telegram Bot для получения заявок.**

## ✨ Особенности

- **Современный дизайн** — минимализм с элементами glassmorphism
- **Полная адаптивность** — корректное отображение от 320px до 1920px+
- **Тёмная тема** — автоматическое переключение через `prefers-color-scheme`
- **Доступность (a11y)** — ARIA-атрибуты, навигация с клавиатуры, видимый фокус
- **Валидация форм** — HTML5 + JavaScript в реальном времени
- **Анимации** — плавные переходы и появление элементов при скролле
- **Без зависимостей** — только Tailwind CSS CDN и Google Fonts
- **🔔 Telegram интеграция** — автоматическая отправка заявок в Telegram бот

## 📁 Структура проекта

```
project/
├── index.html      # Основная HTML-разметка
├── style.css       # Дополнительные CSS стили
├── script.js       # Логика валидации и обработки формы
└── README.md       # Документация
```

## 🚀 Быстрый старт

### Способ 1: Открыть напрямую в браузере

Просто откройте файл `index.html` в любом современном браузере:

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

> ⚠️ **Примечание:** При открытии напрямую некоторые функции (например, шрифты) могут не работать из-за CORS-политики браузера. Рекомендуется использовать локальный сервер.

### Способ 2: Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Затем откройте в браузере:
# http://localhost:8000
```

### Способ 3: Node.js Serve

```bash
# Установка и запуск через npx
npx serve .

# Или установите глобально
npm install -g serve
serve .

# Затем откройте в браузере:
# http://localhost:3000 (или другой порт)
```

### Способ 4: VS Code Live Server

Если вы используете VS Code:
1. Установите расширение [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Откройте `index.html`
3. Нажмите "Go Live" в статусной строке

## 🎨 Настройка и кастомизация

### Изменение цветовой схемы

Откройте `index.html` и найдите конфигурацию Tailwind:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: { /* ваши цвета */ },
                accent: { /* ваши цвета */ }
            }
        }
    }
}
```

### Изменение шрифтов

В секции `<head>` файла `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Замените `Manrope` на любой другой шрифт из [Google Fonts](https://fonts.google.com/).

### Интеграция с Telegram Bot

#### Шаг 1: Создание бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Введите имя бота (например, `ARB TECH Notifications`)
4. Введите username бота (должен заканчиваться на `bot`, например `arb_tech_bot`)
5. BotFather выдаст вам **токен бота** (выглядит как `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Шаг 2: Получение Chat ID

**Для личного чата:**
1. Найдите созданного бота в Telegram и нажмите Start
2. Откройте [@userinfobot](https://t.me/userinfobot) и отправьте любое сообщение
3. Бот ответит вашим Chat ID (число, например `123456789`)

**Для канала:**
1. Создайте канал и добавьте туда бота как администратора
2. Chat ID канала — это его username с `@` в начале (например, `@arb_tech_channel`)
   или числовой ID с `-100` в начале (например, `-1001234567890`)

#### Шаг 3: Настройка в script.js

Откройте `script.js` и найдите объект `CONFIG` в начале файла:

```javascript
const CONFIG = {
    DEBUG: true,
    
    // Telegram Bot Configuration
    TELEGRAM_BOT_TOKEN: '', // Ваш токен
    TELEGRAM_CHAT_ID: '', // Ваш chat_id или @username
    
    // ... остальные настройки
};
```

**Вставьте ваши значения:**
- `TELEGRAM_BOT_TOKEN` — токен от BotFather
- `TELEGRAM_CHAT_ID` — ваш chat_id или username канала

#### Шаг 4: Проверка работы

1. Запустите локальный сервер
2. Заполните форму и отправьте сообщение
3. Проверьте Telegram — вы должны получить сообщение с данными формы

> ⚠️ **Важно:** Токен бота является секретным ключом. Не публикуйте его в публичных репозиториях! Для production используйте environment variables или прокси-сервер.

---

### Интеграция с реальным бэкендом

#### 1. Замените имитацию отправки на реальный fetch

Откройте `script.js` и найдите функцию `handleSubmit`. Замените вызов `sendToTelegram` на:

```javascript
// Вместо sendToTelegram(formData) используйте:
const response = await fetch(CONFIG.API_ENDPOINT, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // Добавьте заголовки авторизации если нужно
        // 'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify(formData)
});

if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}

const data = await response.json();
```

#### 2. Настройте API_ENDPOINT

В начале `script.js` измените конфигурацию:

```javascript
const CONFIG = {
    DEBUG: false, // Отключите логирование в production
    API_ENDPOINT: 'https://your-api.com/api/contact', // Ваш URL
    SIMULATION_DELAY: 0, // Можно убрать задержку
    // ... остальные настройки
};
```

#### 3. Пример бэкенда на Node.js/Express

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    // Валидация на сервере
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    // Здесь логика отправки (email, база данных и т.д.)
    console.log('Новое сообщение:', { name, email, message });
    
    res.json({ 
        success: true, 
        message: 'Сообщение получено' 
    });
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});
```

## ♿ Доступность (Accessibility)

Проект включает следующие улучшения доступности:

- ✅ Семантическая разметка (`main`, `section`, `article`, `nav`, `footer`)
- ✅ ARIA-атрибуты для динамических элементов
- ✅ Skip link для быстрой навигации
- ✅ Видимый фокус для навигации с клавиатуры
- ✅ Контрастность текста соответствует WCAG 2.1 AA
- ✅ Поддержка `prefers-reduced-motion` для пользователей с вестибулярными нарушениями
- ✅ Поддержка `prefers-contrast: high` для пользователей с ослабленным зрением

## 📱 Адаптивность

Сайт оптимизирован для следующих разрешений:

- 📱 **Mobile:** 320px — 640px
- 📱 **Tablet:** 641px — 1024px
- 💻 **Desktop:** 1025px — 1920px
- 🖥 **Large Desktop:** 1921px+

## 🔧 Технические детали

### Используемые технологии

| Технология | Версия | Назначение |
|------------|--------|------------|
| HTML5 | Latest | Семантическая разметка |
| CSS3 | Latest | Стилизация и анимации |
| Tailwind CSS | 3.x (CDN) | Утилитарные классы |
| Vanilla JS | ES6+ | Логика и валидация |
| Google Fonts | Latest | Типографика (Manrope) |

### Браузерная поддержка

- ✅ Chrome (последние 2 версии)
- ✅ Firefox (последние 2 версии)
- ✅ Safari (последние 2 версии)
- ✅ Edge (последние 2 версии)
- ✅ Mobile Safari & Chrome

## 🎯 Функциональные возможности формы

### Валидация

- **Имя:** обязательно, 2-50 символов, только буквы
- **Email:** обязательно, корректный формат email
- **Сообщение:** обязательно, 10-1000 символов

### Состояния формы

- 📝 **Input focus** — подсветка активного поля
- ✅ **Valid** — зелёная обводка и галочка
- ❌ **Invalid** — красная обводка и сообщение об ошибке
- ⏳ **Loading** — спиннер на кнопке, блокировка повторной отправки
- 🎉 **Success** — сообщение об успехе + toast-уведомление
- ⚠️ **Error** — сообщение об ошибке + возможность повторной отправки

### Защита от злоупотреблений

- Debounce для валидации (300ms)
- Блокировка повторной отправки во время выполнения запроса
- Санитизация входных данных (защита от XSS)

## 📝 Лицензия

MIT License — свободное использование с указанием авторства.

---

**Сделано с ❤️ для демонстрации современных веб-технологий**
