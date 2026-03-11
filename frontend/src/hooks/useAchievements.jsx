import { createContext, useContext, useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { useQR } from './useQR'; // We might need dark mode from here, but we can't easily import it if it uses the same provider nestedly. We'll grab theme from localStorage or just pass it in.

const AchievementsContext = createContext(null);

export const ACHIEVEMENTS_LIST = {
    FIRST_QR: { id: 'FIRST_QR', title: 'Новичок', description: 'Создать первый QR-код', icon: '🌟' },
    QR_MASTER: { id: 'QR_MASTER', title: 'Мастер QR', description: 'Создать 10 QR-кодов', icon: '👑' },
    CUSTOMIZER: { id: 'CUSTOMIZER', title: 'Художник', description: 'Использован градиент и свой цвет', icon: '🎨' },
    LOGO_USER: { id: 'LOGO_USER', title: 'Брендинг', description: 'Добавить логотип в QR-код', icon: '🖼️' },
};

export function AchievementsProvider({ children }) {
    const [unlocked, setUnlocked] = useState([]);
    const [queue, setQueue] = useState([]); // Toasts to show

    // Load from local storage on mount
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('qr_achievements')) || [];
            if (Array.isArray(saved)) setUnlocked(saved);
        } catch (e) {
            console.error('Failed to load achievements', e);
        }
    }, []);

    const unlockAchievement = (id) => {
        if (unlocked.includes(id) || !ACHIEVEMENTS_LIST[id]) return;

        const newUnlocked = [...unlocked, id];
        setUnlocked(newUnlocked);
        localStorage.setItem('qr_achievements', JSON.stringify(newUnlocked));

        // Add to queue to show toast
        setQueue(prev => [...prev, ACHIEVEMENTS_LIST[id]]);
    };

    const removeToast = (id) => {
        setQueue(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <AchievementsContext.Provider value={{ unlocked, unlockAchievement }}>
            {children}
            {/* Toasts overlay */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {queue.map((toast) => (
                        <Toast
                            key={toast.id + Date.now()}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </AchievementsContext.Provider>
    );
}

function Toast({ toast, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="bg-gray-900 border border-indigo-500/30 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]"
        >
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-2xl shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/20 animate-ping"></div>
                <span className="relative z-10">{toast.icon}</span>
            </div>
            <div>
                <h4 className="font-bold text-sm text-yellow-400 flex items-center gap-1">
                    <Trophy size={14} /> Достижение открыто!
                </h4>
                <p className="text-sm font-semibold mt-0.5">{toast.title}</p>
                <p className="text-xs text-white/50">{toast.description}</p>
            </div>
        </motion.div>
    );
}

export function useAchievements() {
    return useContext(AchievementsContext);
}
