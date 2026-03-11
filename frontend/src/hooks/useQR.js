import { createContext, useContext } from 'react';

export const QRContext = createContext(null);

export function useQR() {
    const context = useContext(QRContext);
    if (!context) {
        throw new Error('useQR must be used within a QRProvider');
    }
    return context;
}
