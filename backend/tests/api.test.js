const request = require('supertest');
const app = require('../index');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

// Helper to reset DB
const resetDb = () => {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
};

beforeEach(() => {
    resetDb();
});

afterAll(() => {
    resetDb();
});

describe('QR Generator API', () => {

    it('should create a new QR code entry (POST /api/qr/generate)', async () => {
        const payload = {
            type: 'url',
            content: 'https://jestjs.io',
            qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
            design: {
                colorDark: '#ffffff',
                colorLight: '#000000',
            }
        };

        const response = await request(app)
            .post('/api/qr/generate')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.content).toBe('https://jestjs.io');
    });

    it('should fail validation when content is missing', async () => {
        const payload = {
            type: 'url',
            qrCode: 'data:image/png;base64,123',
            design: {}
        };

        const response = await request(app)
            .post('/api/qr/generate')
            .send(payload)
            .expect(400);

        expect(response.body.errors).toBeDefined();
    });

    it('should retrieve history with pagination (GET /api/qr/history)', async () => {
        // Create dummy entry
        const payload = { type: 'text', content: 'hello', qrCode: 'data', design: {} };
        await request(app).post('/api/qr/generate').send(payload);

        const response = await request(app)
            .get('/api/qr/history?page=1&limit=10')
            .expect(200);

        expect(response.body.data.length).toBe(1);
        expect(response.body.total).toBe(1);
        expect(response.body.data[0].content).toBe('hello');
    });

    it('should delete a QR code by ID (DELETE /api/qr/:id)', async () => {
        const payload = { type: 'text', content: 'delete_me', qrCode: 'data', design: {} };
        const createRes = await request(app).post('/api/qr/generate').send(payload);
        const id = createRes.body.id;

        await request(app).delete(`/api/qr/${id}`).expect(200);

        // Ensure it's deleted
        const db = JSON.parse(fs.readFileSync(DB_PATH));
        expect(db.length).toBe(0);
    });

    it('should clear the entire history (DELETE /api/qr/clear)', async () => {
        const payload = { type: 'text', content: 'clear_me', qrCode: 'data', design: {} };
        await request(app).post('/api/qr/generate').send(payload);

        await request(app).delete('/api/qr/clear').expect(200);

        const db = JSON.parse(fs.readFileSync(DB_PATH));
        expect(db.length).toBe(0);
    });
});
