import { useState } from 'react';
import { useQR } from '../hooks/useQR';
import { useAchievements, ACHIEVEMENTS_LIST } from '../hooks/useAchievements';
import { cn } from '../utils';
import { Trash2, DownloadCloud, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function HistoryRibbon({ onSelectHistoryItem }) {
    const { history, setDbHistory, isDarkTheme } = useQR();
    const { unlocked } = useAchievements();
    const [lockedAchModal, setLockedAchModal] = useState(null);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:3001/api/qr/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDbHistory(prev => prev.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Вы уверены, что хотите полностью очистить историю?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/qr/clear`, { method: 'DELETE' });
            if (res.ok) setDbHistory([]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAchievementClick = (ach) => {
        if (!unlocked.includes(ach.id)) {
            setLockedAchModal(ach);
        }
    };



    return (
        <div className="w-full h-full flex flex-col min-h-0">
            {/* Achievements Section */}
            <div className="mb-6 shrink-0">
                <h3 className={cn("text-sm font-bold flex items-center gap-2 mb-3", isDarkTheme ? "text-yellow-400" : "text-yellow-600")}>
                    <Trophy size={16} /> Ваши достижения
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {Object.values(ACHIEVEMENTS_LIST).map(ach => {
                        const isUnlocked = unlocked.includes(ach.id);
                        return (
                            <div 
                                key={ach.id} 
                                onClick={() => handleAchievementClick(ach)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[70px] p-2 rounded-xl border transition-all cursor-pointer",
                                    isUnlocked 
                                        ? (isDarkTheme ? "bg-indigo-500/20 border-indigo-400 text-white" : "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm hover:bg-indigo-100")
                                        : (isDarkTheme ? "bg-white/5 border-white/10 opacity-40 grayscale hover:opacity-70" : "bg-black/5 border-black/10 opacity-40 grayscale hover:opacity-70")
                                )}
                                title={isUnlocked ? ach.title : 'Достижение заблокировано'}
                            >
                                <span className="text-2xl mb-1">{ach.icon}</span>
                                <span className="text-[9px] font-bold text-center leading-tight uppercase tracking-wider line-clamp-2">
                                    {ach.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 shrink-0 mt-2">
                <h3 className={cn("text-lg font-bold flex items-center gap-2", isDarkTheme ? "text-white" : "text-black/80")}>
                    <DownloadCloud size={18} /> Ваша История
                </h3>
                {history.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        className="text-xs text-red-500 hover:text-red-400 font-semibold px-4 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Очистить
                    </button>
                )}
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4 overflow-y-auto w-full custom-scrollbar p-1 flex-1">
                <AnimatePresence>
                    {history.length > 0 ? (
                        history.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={cn(
                                    "flex flex-col p-3 rounded-2xl transition-all cursor-pointer relative group overflow-hidden border self-start",
                                    isDarkTheme
                                        ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        : "bg-white border-black/5 shadow-sm hover:shadow-lg hover:border-black/10"
                                )}
                                onClick={() => onSelectHistoryItem && onSelectHistoryItem(item)}
                            >
                                <div className="w-full aspect-square bg-white rounded-xl mb-3 overflow-hidden p-2 flex items-center justify-center shadow-inner relative group-hover:scale-[0.98] transition-transform">
                                    <img src={item.qrCode} alt="History QR" className="w-full h-full object-contain" />

                                    <div className="absolute top-1 right-1 flex flex-col gap-2">
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                            title="Удалить навсегда"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                <p className={cn("text-xs font-semibold truncate w-full mb-1 px-1", isDarkTheme ? "text-white/90" : "text-black/90")}>
                                    {item.content}
                                </p>
                                <p className={cn("text-[10px] uppercase tracking-wider font-mono px-1", isDarkTheme ? "text-white/40" : "text-black/40")}>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </motion.div>
                        ))
                    ) : (
                        <div className={cn("col-span-full w-full py-12 text-center text-sm font-medium border-2 border-dashed rounded-3xl", isDarkTheme ? "text-white/30 border-white/10" : "text-black/30 border-black/10")}>
                            История пуста.
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Locked Achievement Premium Modal */}
            <AnimatePresence>
                {lockedAchModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setLockedAchModal(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className={cn("p-6 max-w-sm w-full rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 text-center border relative overflow-hidden",
                                isDarkTheme ? "bg-[#111] border-white/10 shadow-black/80 text-white" : "bg-white border-black/5 shadow-xl shadow-black/10 text-slate-900"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setLockedAchModal(null)}
                                className={cn("absolute top-4 right-4 p-2 rounded-full transition-colors", isDarkTheme ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-black/5 text-black/50 hover:text-black")}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            
                            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-2", isDarkTheme ? "bg-white/5" : "bg-black/5")}>
                                <span className={cn("grayscale opacity-50")}>{lockedAchModal.icon}</span>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-black mb-2">{lockedAchModal.title}</h3>
                                <p className={cn("text-sm font-medium leading-relaxed", isDarkTheme ? "text-white/60" : "text-black/60")}>
                                    Упс, это достижение пока заблокировано. Чтобы его получить, вам нужно:<br/>
                                    <span className={cn("inline-block mt-3 font-bold px-4 py-2 rounded-xl", isDarkTheme ? "bg-indigo-500/20 border-indigo-500/30 border text-indigo-300" : "bg-indigo-50 border-indigo-100 border text-indigo-700")}>
                                        {lockedAchModal.description}
                                    </span>
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setLockedAchModal(null)}
                                className={cn("w-full py-4 mt-2 rounded-xl font-bold transition-all active:scale-95", isDarkTheme ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black")}
                            >
                                Понятно
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
