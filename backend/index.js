const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Инициализация БД, если файла нет
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

// Схема валидации
const QRSchema = z.object({
    content: z.string().min(1, "Содержимое обязательно"),
    colorDark: z.string().optional(),
    colorLight: z.string().optional(),
    dotsType: z.string().optional(),
    cornersSquareType: z.string().optional(),
    cornersDotType: z.string().optional(),
    logoBase64: z.string().optional(),
    qrCode: z.string().min(1, "Изображение QR-кода обязательно (Base64)"),
});

// Роут для сохранения сгенерированного на клиенте QR-кода
app.post('/api/qr/generate', async (req, res) => {
    try {
        const validatedData = QRSchema.parse(req.body);

        const newQR = {
            id: uuidv4(),
            ...validatedData,
            createdAt: new Date().toISOString(),
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

// Роут для истории
// Роут для загрузки истории
app.get('/api/qr/history', (req, res) => {
    try {
        const db = readDB();
        // Сортировка от новых к старым
        const sortedHistory = [...db].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        res.json(sortedHistory);
    } catch (error) {
        res.status(500).json({ error: "Не удалось загрузить историю" });
    }
});

// Полная очистка истории
app.delete('/api/qr/clear', (req, res) => {
    try {
        writeDB([]);
        res.status(200).json({ message: "История очищена" });
    } catch (error) {
        res.status(500).json({ error: "Не удалось очистить историю" });
    }
});

// Удаление конкретной записи
app.delete('/api/qr/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();
        const initialLength = db.length;
        const filteredDB = db.filter(item => item.id !== id);

        if (initialLength === filteredDB.length) {
            return res.status(404).json({ error: "Запись не найдена" });
        }

        writeDB(filteredDB);
        res.status(200).json({ message: "Запись удалена" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении записи" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
