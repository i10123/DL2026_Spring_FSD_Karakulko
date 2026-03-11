import { useState, useCallback } from 'react';
import { useQR } from '../../hooks/useQR';
import { cn } from '../../utils';
import { UploadCloud, X, Image as ImageIcon, Maximize, Target, Palette, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPalette } from 'colorthief';

export function LogoUpload() {
    const { config, setConfig, isDarkTheme } = useQR();
    const [isDragOver, setIsDragOver] = useState(false);

    const [suggestedColors, setSuggestedColors] = useState(null);

    const handleFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            setConfig({ logoBase64: dataUrl });
            
            // Extract colors
            const img = new Image();
            img.onload = async () => {
                try {
                    const palette = await getPalette(img, 2);
                    if (palette && palette.length >= 2) {
                        setSuggestedColors({
                            primary: palette[0].hex(),
                            secondary: palette[1].hex(),
                        });
                    }
                } catch (err) {
                    console.error('Colorthief error', err);
                }
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }, [setConfig]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const onChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    }, [handleFile]);

    const clearLogo = () => {
        setConfig({ logoBase64: '' });
        setSuggestedColors(null);
    };

    const applyColors = () => {
        if (suggestedColors) {
            setConfig({ 
                colorDark: suggestedColors.primary, 
                colorGradient2: suggestedColors.secondary,
                useGradient: true,
                gradientType: 'linear'
            });
        }
    };

    return (
        <div className="space-y-4">
            <h3 className={cn("text-sm font-semibold flex items-center gap-2", isDarkTheme ? "text-white" : "text-black/80")}>
                <ImageIcon size={16} /> Логотип по центру
            </h3>

            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 overflow-hidden",
                    isDragOver
                        ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
                        : isDarkTheme
                            ? "border-white/20 hover:border-white/30 hover:bg-white/5"
                            : "border-black/20 hover:border-black/30 hover:bg-black/5"
                )}
            >
                <AnimatePresence mode="wait">
                    {config.logoBase64 ? (
                        <motion.div
                            key="uploaded"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-4 w-full"
                        >
                            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center p-2 shrink-0 border backdrop-blur-sm bg-white", isDarkTheme ? "border-white/10" : "border-black/10 shadow-sm")}>
                                <img src={config.logoBase64} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex-1 text-left z-10">
                                <p className={cn("text-xs font-medium line-clamp-1", isDarkTheme ? "text-white" : "text-black")}>Пользовательский логотип</p>
                                <p className={cn("text-[10px]", isDarkTheme ? "text-white/50" : "text-black/50")}>Нажмите крестик чтобы удалить</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); clearLogo(); }}
                                className="relative z-20 w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                title="Удалить логотип"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center pointer-events-none"
                        >
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-2", isDarkTheme ? "bg-white/5 text-white/50" : "bg-black/5 text-black/50")}>
                                <UploadCloud size={24} />
                            </div>
                            <p className={cn("text-sm font-medium", isDarkTheme ? "text-white/80" : "text-black/80")}>
                                Перетащите изображение сюда
                            </p>
                            <p className={cn("text-xs mt-1", isDarkTheme ? "text-white/40" : "text-black/40")}>
                                PNG, JPG или SVG
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!config.logoBase64 && (
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={onChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Выбрать логотип"
                    />
                )}
            </div>

            {/* Logo Settings Controls */}
            {config.logoBase64 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-4 mt-4 pt-2"
                >
                    {/* Size Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={cn("text-[10px] uppercase font-bold tracking-wider flex items-center gap-1", isDarkTheme ? "text-white/60" : "text-black/60")}>
                                <Maximize size={12} /> Размер
                            </label>
                            <span className={cn("text-[10px] tabular-nums font-mono", isDarkTheme ? "text-white/40" : "text-black/40")}>
                                {Math.round(config.logoSize * 100)}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="0.8"
                            step="0.05"
                            value={config.logoSize}
                            onChange={(e) => setConfig({ logoSize: parseFloat(e.target.value) })}
                            className={cn(
                                "w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none",
                                isDarkTheme ? "bg-white/10 accent-indigo-400" : "bg-black/10 accent-indigo-600"
                            )}
                        />
                    </div>

                    {/* Margin Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={cn("text-[10px] uppercase font-bold tracking-wider flex items-center gap-1", isDarkTheme ? "text-white/60" : "text-black/60")}>
                                <Target size={12} /> Отступ
                            </label>
                            <span className={cn("text-[10px] tabular-nums font-mono", isDarkTheme ? "text-white/40" : "text-black/40")}>
                                {config.logoMargin}px
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="2"
                            value={config.logoMargin}
                            onChange={(e) => setConfig({ logoMargin: parseInt(e.target.value) })}
                            className={cn(
                                "w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none",
                                isDarkTheme ? "bg-white/10 accent-indigo-400" : "bg-black/10 accent-indigo-600"
                            )}
                        />
                    </div>
                </motion.div>
            )}

            {/* Color Suggestions from Logo */}
            <AnimatePresence>
            {suggestedColors && config.logoBase64 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn(
                        "mt-6 p-4 rounded-[2rem] border relative overflow-hidden group",
                        isDarkTheme ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-xl shadow-indigo-500/5"
                    )}
                >
                    {/* Background Gradient Glow */}
                    <div 
                        className="absolute inset-0 opacity-20 blur-3xl -z-10 group-hover:scale-110 transition-transform duration-1000"
                        style={{ 
                            background: `linear-gradient(45deg, ${suggestedColors.primary}, ${suggestedColors.secondary})` 
                        }}
                    />

                    <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                                    <Palette size={20} />
                                </div>
                                <div>
                                    <h4 className={cn("text-sm font-bold", isDarkTheme ? "text-white" : "text-black")}>Магия цвета</h4>
                                    <p className={cn("text-[10px] uppercase tracking-wider font-bold opacity-50", isDarkTheme ? "text-white" : "text-black")}>Палитра вашего бренда</p>
                                </div>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg ring-4 ring-indigo-500/5" style={{ backgroundColor: suggestedColors.primary }} />
                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg ring-4 ring-indigo-500/5" style={{ backgroundColor: suggestedColors.secondary }} />
                            </div>
                        </div>

                        {/* Gradient Preview Line */}
                        <div 
                            className="h-12 w-full rounded-2xl shadow-inner border border-white/20"
                            style={{ 
                                background: `linear-gradient(90deg, ${suggestedColors.primary}, ${suggestedColors.secondary})` 
                            }}
                        />

                        <button
                            onClick={applyColors}
                            className={cn(
                                "w-full py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn",
                                isDarkTheme 
                                    ? "bg-white text-black hover:bg-gray-100" 
                                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                            )}
                        >
                            <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="flex items-center gap-2"
                            >
                                <Sparkles size={16} /> Применить цвета бренда к QR-коду
                            </motion.span>
                        </button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}
