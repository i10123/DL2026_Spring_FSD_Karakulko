import { useState, useCallback } from 'react';
import { useQR } from './useQR';

export function useQRApi() {
    const {
        config,
        currentQrData,
        qrInstance,
        setIsLoading,
        fetchDbHistory
    } = useQR();

    const [error, setError] = useState(null);

    const saveToHistory = useCallback(async () => {
        if (config.activeTab === 'url' && !config.content?.trim()) {
            throw new Error('Данные не могут быть пустыми');
        }

        if (!qrInstance) return;

        setIsLoading(true);
        setError(null);

        try {
            // 1. Get raw binary data from QR styling instance
            const qrDataUrl = await qrInstance.getRawData('png');
            const blob = new Blob([qrDataUrl]);

            // 2. Convert Blob to Base64 String for JSON payload
            const base64Url = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to read Blob'));
                reader.readAsDataURL(blob);
            });

            // 3. Prepare payload matching new backend Zod schema
            const payload = {
                type: config.activeTab,
                content: currentQrData,
                design: {
                    colorDark: config.colorDark,
                    colorLight: config.colorLight,
                    dotsType: config.dotsType,
                    cornersSquareType: config.cornersSquareType,
                    cornersDotType: config.cornersDotType,
                    logoBase64: config.logoBase64 || undefined,
                    errorCorrectionLevel: config.errorCorrectionLevel,
                    size: config.size
                },
                qrCode: base64Url
            };

            // 4. Send to Backend
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
            const res = await fetch(`${baseUrl}/api/qr/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Ошибка при сохранении QR-кода на сервере');
            }

            // 5. Refresh history list
            await fetchDbHistory();

            return true;
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [config, currentQrData, qrInstance, fetchDbHistory, setIsLoading]);

    return { saveToHistory, apiError: error, setApiError: setError };
}
