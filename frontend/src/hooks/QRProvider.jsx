import { useState, useEffect, useCallback } from 'react';
import { QRContext } from './useQR';
import { useQRHistory } from './useQRHistory';

export const INITIAL_CONFIG = {
    activeTab: 'url',
    // URL
    content: 'https://t.me/i10123',
    // Text
    textContent: '',
    // Wi-Fi
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
    // vCard
    vcardName: '',
    vcardPhone: '',
    vcardEmail: '',
    vcardTitle: '',
    vcardCompany: '',
    vcardWebsite: '',
    // Event
    eventTitle: '',
    eventLocation: '',
    eventStart: '',
    eventEnd: '',
    eventDescription: '',
    // Email
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    // SMS
    smsPhone: '',
    smsText: '',
    // Geo
    geoLat: '',
    geoLng: '',

    // Styling
    colorDark: '#0a0a0a',
    useGradient: false,
    gradientType: 'linear',
    colorGradient2: '#4f46e5',
    colorLight: '#ffffff',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
    logoBase64: '',
    logoSize: 0.4,
    logoMargin: 10,
    errorCorrectionLevel: 'Q',
    size: 300,
    // Smart Input
    isSmartMode: false,
    smartInput: '',
};

export function QRProvider({ children }) {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const [history, setDbHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [qrInstance, setQrInstance] = useState(null);

    const { config, setConfig, undo, redo, canUndo, canRedo, resetHistory } = useQRHistory(INITIAL_CONFIG);



    // Compute currentQrData
    const getQrDataObj = useCallback(() => {
        const c = config;

        const escape = (str) => String(str || '').replace(/[\\;,":\n]/g, '\\$&');
        const sanitize = (str) => (str || '').replace(/\n/g, ' '); // simple line-break removal for text fields

        switch (c.activeTab) {
            case 'url':
                return c.content ? c.content : '';
            case 'text':
                return c.textContent ? c.textContent : '';
            case 'wifi':
                return c.wifiSsid ? `WIFI:T:${c.wifiEncryption};S:${escape(c.wifiSsid)};P:${escape(c.wifiPassword)};;` : '';
            case 'vcard':
                return (c.vcardName || c.vcardPhone || c.vcardEmail) ? 
                    `BEGIN:VCARD\nVERSION:3.0\nN;CHARSET=UTF-8:${escape(c.vcardName)};;;\nFN;CHARSET=UTF-8:${escape(c.vcardName)}\nORG;CHARSET=UTF-8:${escape(c.vcardCompany)}\nTITLE;CHARSET=UTF-8:${escape(c.vcardTitle)}\nTEL;TYPE=CELL:${escape(c.vcardPhone)}\nEMAIL:${escape(c.vcardEmail)}\nURL:${escape(c.vcardWebsite)}\nEND:VCARD` 
                    : '';
            case 'event': {
                if (!c.eventTitle) return '';
                const formatDT = (dt) => {
                    if (!dt) return '';
                    return new Date(dt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                };
                return `BEGIN:VEVENT\nSUMMARY:${escape(c.eventTitle)}\nLOCATION:${escape(c.eventLocation)}\nDESCRIPTION:${escape(c.eventDescription)}\nDTSTART:${formatDT(c.eventStart)}\nDTEND:${formatDT(c.eventEnd)}\nEND:VEVENT`;
            }
            case 'email':
                return c.emailTo ? `mailto:${c.emailTo}?subject=${encodeURIComponent(c.emailSubject)}&body=${encodeURIComponent(c.emailBody)}` : '';
            case 'sms':
                return c.smsPhone ? `smsto:${c.smsPhone}:${c.smsText}` : '';
            case 'geo':
                return (c.geoLat && c.geoLng) ? `geo:${c.geoLat},${c.geoLng}` : '';
            default:
                return c.content ? c.content : '';
        }
    }, [config]);

    // Detection Logic for Smart Input
    const detectedType = useCallback((input) => {
        if (!input) return null;
        if (/^(https?:\/\/|www\.)/i.test(input)) return 'url';
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) return 'email';
        if (/^WIFI:S:/i.test(input)) return 'wifi';
        if (/^(tel:|\+?[0-9]{10,15}$)/i.test(input)) return 'tel';
        if (/^smsto:/i.test(input)) return 'sms';
        return 'text';
    }, []);

    const currentQrData = config.isSmartMode ? config.smartInput : getQrDataObj();
    const currentDetectedType = config.isSmartMode ? detectedType(config.smartInput) : config.activeTab;

    // Load backend history
    const fetchDbHistory = useCallback(async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
            const res = await fetch(`${baseUrl}/api/qr/history`);
            if (res.ok) {
                const result = await res.json();
                setDbHistory(result.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchDbHistory();
    }, [fetchDbHistory]);

    const value = {
        isDarkTheme,
        setIsDarkTheme,

        // UI Config
        config,
        setConfig,
        undo,
        redo,
        canUndo,
        canRedo,
        resetHistory,
        currentQrData,
        currentDetectedType,
        detectedType,

        // DB History
        history,
        setDbHistory,
        fetchDbHistory,
        isLoading,
        setIsLoading,



        // Reference to QR styling instance for Save/Download operations
        qrInstance,
        setQrInstance
    };

    return (
        <QRContext.Provider value={value}>
            {children}
        </QRContext.Provider>
    );
}
