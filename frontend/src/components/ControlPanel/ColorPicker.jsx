import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useQR } from '../../hooks/useQR';
import { cn } from '../../utils';
import { Palette, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ColorPicker() {
    const { config, setConfig, isDarkTheme } = useQR();
    const [isOpen, setIsOpen] = useState(false);
    const [activePicker, setActivePicker] = useState(null);

    const updateColor = (key, color) => {
        setConfig({ [key]: color });
    };

    const ColorBtn = ({ label, colorKey, value }) => (
        <div className="relative">
            <label className={cn("block text-sm font-medium mb-2 ml-1", isDarkTheme ? "text-white/40" : "text-black/40")}>
                {label}
            </label>
            <button
                onClick={() => setActivePicker(activePicker === colorKey ? null : colorKey)}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all border",
                    isDarkTheme ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-black/5 hover:border-black/10 shadow-sm"
                )}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg shadow-inner border border-black/5" style={{ backgroundColor: value }} />
                    <span className="text-sm font-mono font-medium">{value}</span>
                </div>
            </button>

            <AnimatePresence>
                {activePicker === colorKey && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute z-50 top-full pt-3 left-0"
                    >
                        <div className={cn(
                            "p-4 rounded-[2rem] shadow-2xl backdrop-blur-3xl border",
                            isDarkTheme ? "bg-gray-900 border-white/10" : "bg-white border-black/5"
                        )}>
                            <HexColorPicker color={value} onChange={(c) => updateColor(colorKey, c)} />
                            <div className="mt-4 flex justify-end">
                                <button 
                                    onClick={() => setActivePicker(null)} 
                                    className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                                >
                                    Готово
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className={cn(
            "rounded-3xl border transition-all duration-300",
            isOpen 
                ? (isDarkTheme ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-xl")
                : (isDarkTheme ? "bg-transparent border-transparent" : "bg-transparent border-transparent")
        )}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 group"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                        isOpen 
                            ? "bg-indigo-600 text-white" 
                            : (isDarkTheme ? "bg-white/5 text-white/50 group-hover:bg-white/10" : "bg-black/5 text-black/50 group-hover:bg-black/10")
                    )}>
                        <Palette size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className={cn("text-base font-bold transition-colors", isDarkTheme ? "text-white" : "text-black")}>Настройки цвета</h3>
                        <p className={cn("text-xs font-medium opacity-50", isDarkTheme ? "text-white" : "text-black")}>
                            {config.useGradient ? 'Градиент активен' : 'Сплошной цвет'}
                        </p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className={isDarkTheme ? "text-white/30" : "text-black/30"}
                >
                    <ChevronDown size={20} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-0 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                <span className={cn("text-sm font-bold", isDarkTheme ? "text-indigo-200" : "text-indigo-900")}>Использовать градиент</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={config.useGradient}
                                        onChange={(e) => setConfig({ useGradient: e.target.checked })}
                                    />
                                    <div className={cn(
                                        "w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md",
                                        isDarkTheme ? "bg-white/10 peer-checked:bg-indigo-600" : "bg-gray-200 peer-checked:bg-indigo-600"
                                    )}></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <ColorBtn label="Главный" colorKey="colorDark" value={config.colorDark} />
                                {config.useGradient ? (
                                    <ColorBtn label="Дополнительный" colorKey="colorGradient2" value={config.colorGradient2} />
                                ) : (
                                    <ColorBtn label="Фон" colorKey="colorLight" value={config.colorLight} />
                                )}
                            </div>

                            {config.useGradient && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2.5 ml-1", isDarkTheme ? "text-white/40" : "text-black/40")}>
                                            Тип
                                        </label>
                                        <select
                                            value={config.gradientType}
                                            onChange={(e) => setConfig({ gradientType: e.target.value })}
                                            className={cn(
                                                "w-full appearance-none px-4 py-3 rounded-2xl outline-none transition-all border text-sm font-bold",
                                                isDarkTheme ? "bg-white/5 border-white/10 text-white" : "bg-white border-black/5 text-black shadow-sm"
                                            )}
                                        >
                                            <option value="linear">Линейный</option>
                                            <option value="radial">Радиальный</option>
                                        </select>
                                    </div>
                                    <ColorBtn label="Фон" colorKey="colorLight" value={config.colorLight} />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
