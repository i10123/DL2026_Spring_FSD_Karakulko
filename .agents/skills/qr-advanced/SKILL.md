# QR Code Advanced Features Skill

## Триггеры
Используй этот скил когда пользователь хочет:
- Создать QR-код с продвинутыми настройками
- Добавить градиенты, анимацию или 3D эффекты
- Сгенерировать QR для Wi-Fi, vCard, событий
- Создать динамический QR с аналитикой
- Добавить брендирование (логотип, фирменные цвета)

## Лучшие практики

### 1. Дизайн QR-кодов
- **Контрастность**: минимум 3:1 между фоном и точками
- **Тихая зона**: отступ минимум 4 модуля со всех сторон
- **Размер логотипа**: не более 20% площади при уровне коррекции H
- **Градиенты**: используй радиальные для точек, линейные для фона

### 2. Продвинутые типы QR
```javascript
// Wi-Fi QR
WIFI:T:WPA;S:NetworkName;P:Password;;

// vCard QR
BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
END:VCARD

// Event QR
BEGIN:VEVENT
SUMMARY:Meeting
DTSTART:20260315T100000Z
DTEND:20260315T110000Z
END:VEVENT
```

### 3. Уровни коррекции ошибок
- L (7%): простые URL без логотипа
- M (15%): стандартные случаи
- Q (25%): с небольшим логотипом
- H (30%): с крупным логотипом или сложным дизайном

### 4. Оптимизация производительности
- Используй Web Workers для генерации больших QR
- Кешируй сгенерированные SVG в localStorage
- Дебаунс пользовательского ввода (300ms)

### 5. Архитектура для масштабирования
```
backend/
  routes/
    qr.routes.js       # CRUD операции
    analytics.routes.js # Статистика сканирований
  services/
    qr.service.js      # Бизнес-логика
    storage.service.js # S3/локальное хранение
  models/
    QRCode.model.js    # id, content, settings, userId, scans
```

## Технические рекомендации

### Библиотеки
- **qr-code-styling**: базовая кастомизация ✓ (уже используется)
- **qrcode-generator**: легковесная альтернатива
- **qrcode.react**: для React компонентов

### API дизайн
```javascript
POST /api/qr/generate
Body: {
  content: string,
  type: 'url' | 'wifi' | 'vcard' | 'text',
  design: {
    colors: { dark, light, gradient? },
    logo?: base64,
    dotStyle: string,
    cornerStyle: string
  }
}

GET /api/qr/history
GET /api/qr/:id/analytics
DELETE /api/qr/:id
```
```