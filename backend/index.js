const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. RATE LIMITING
const generateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per `window` (here, per minute)
    message: { error: "Слишком много запросов на генерацию. Подождите минуту." },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. ДЕЙСТВИЯ С БАЗОЙ ДАННЫХ
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}

const readDB = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// 3. СХЕМЫ ВАЛИДАЦИИ ZOD
const DesignSchema = z.object({
    colorDark: z.string().optional(),
    colorLight: z.string().optional(),
    useGradient: z.boolean().optional(),
    gradientType: z.string().optional(),
    colorGradient2: z.string().optional(),
    dotsType: z.string().optional(),
    cornersSquareType: z.string().optional(),
    cornersDotType: z.string().optional(),
    logoBase64: z.string().optional(),
    errorCorrectionLevel: z.string().optional().default('Q'),
    size: z.number().optional().default(300),
});

const QRSchema = z.object({
    type: z.string().min(1),
    content: z.string().min(1, "Содержимое обязательно"),
    design: DesignSchema,
    qrCode: z.string().min(1, "Изображение QR-кода обязательно (Base64)"),
});

// 4. ENDPOINTS

// POST /api/qr/generate - создание QR
app.post('/api/qr/generate', generateLimiter, (req, res) => {
    try {
        const validatedData = QRSchema.parse(req.body);

        const newQR = {
            id: uuidv4(),
            type: validatedData.type,
            content: validatedData.content,
            design: validatedData.design,
            qrCode: validatedData.qrCode,
            createdAt: new Date().toISOString()
        };

        const db = readDB();
        db.push(newQR);
        writeDB(db);

        res.status(201).json(newQR);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// GET /api/qr/history - история с пагинацией и фильтрами
app.get('/api/qr/history', (req, res) => {
    try {
        const { page = 1, limit = 50, type } = req.query;
        let db = readDB();

        // Сортировка от новых к старым
        db.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Фильтрация
        if (type) {
            db = db.filter(item => item.type === type);
        }

        // Пагинация
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const result = db.slice(startIndex, endIndex);

        res.json({
            total: db.length,
            page: Number(page),
            limit: Number(limit),
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: "Не удалось загрузить историю" });
    }
});

// GET /api/qr/:id - получение конкретного QR
app.get('/api/qr/:id', (req, res) => {
    try {
        const db = readDB();
        const qr = db.find(item => item.id === req.params.id);

        if (!qr) return res.status(404).json({ error: "QR код не найден" });
        res.json(qr);
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// DELETE /api/qr/clear - Полная очистка истории
app.delete('/api/qr/clear', (req, res) => {
    try {
        writeDB([]);
        res.status(200).json({ message: "История очищена" });
    } catch (error) {
        res.status(500).json({ error: "Не удалось очистить историю" });
    }
});

// DELETE /api/qr/:id - Удаление конкретной записи
app.delete('/api/qr/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();
        const filteredDB = db.filter(item => item.id !== id);

        if (db.length === filteredDB.length) {
            return res.status(404).json({ error: "Запись не найдена" });
        }

        writeDB(filteredDB);
        res.status(200).json({ message: "Запись удалена" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении записи" });
    }
});



if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend Server running on port ${PORT}`);
    });
}

module.exports = app;
