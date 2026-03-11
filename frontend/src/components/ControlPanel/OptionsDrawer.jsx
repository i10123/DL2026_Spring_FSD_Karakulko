import { useState } from 'react';
import { useQR } from '../../hooks/useQR';
import { cn } from '../../utils';
import { Settings2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OptionsDrawer() {
    const { config, setConfig, isDarkTheme } = useQR();
    const [isOpen, setIsOpen] = useState(false);

    const SelectField = ({ label, configKey, options }) => (
        <div className="w-full">
            <label className={cn("block text-sm font-medium mb-2.5 ml-1", isDarkTheme ? "text-white/40" : "text-black/40")}>
                {label}
            </label>
            <div className="relative">
                <select
                    value={config[configKey]}
                    onChange={(e) => setConfig({ [configKey]: e.target.value })}
                    className={cn(
                        "w-full appearance-none px-4 py-3 text-sm font-bold rounded-2xl outline-none transition-all border shadow-sm",
                        isDarkTheme
                            ? "bg-white/5 border-white/10 text-white focus:bg-white/10"
                            : "bg-white border-black/5 text-black focus:border-indigo-500/30"
                    )}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className={isDarkTheme ? "bg-gray-900" : "bg-white"}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
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
                        <Settings2 size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className={cn("text-base font-bold transition-colors", isDarkTheme ? "text-white" : "text-black")}>Формы и Размеры</h3>
                        <p className={cn("text-xs font-medium opacity-50", isDarkTheme ? "text-white" : "text-black")}>
                            Стили точек, углов и разрешение
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
                        <div className="p-5 pt-0 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectField
                                    label="Стиль точек"
                                    configKey="dotsType"
                                    options={[
                                        { value: 'rounded', label: 'Закругленный' },
                                        { value: 'dots', label: 'Точки' },
                                        { value: 'classy', label: 'Классический' },
                                        { value: 'classy-rounded', label: 'Клас. закругленный' },
                                        { value: 'square', label: 'Квадратный' },
                                        { value: 'extra-rounded', label: 'Супер закруглен.' }
                                    ]}
                                />
                                <SelectField
                                    label="Стиль углов"
                                    configKey="cornersSquareType"
                                    options={[
                                        { value: 'rounded', label: 'Закругленный' },
                                        { value: 'extra-rounded', label: 'Супер закруглен.' },
                                        { value: 'dot', label: 'Точка' },
                                        { value: 'square', label: 'Квадрат' }
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectField
                                    label="Внутренний угол"
                                    configKey="cornersDotType"
                                    options={[
                                        { value: 'dot', label: 'Точка' },
                                        { value: 'square', label: 'Квадрат' }
                                    ]}
                                />
                                <SelectField
                                    label="Коррекция"
                                    configKey="errorCorrectionLevel"
                                    options={[
                                        { value: 'L', label: 'Низкая (7%)' },
                                        { value: 'M', label: 'Средняя (15%)' },
                                        { value: 'Q', label: 'Высокая (25%)' },
                                        { value: 'H', label: 'Макс. (30%)' }
                                    ]}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className={cn("text-sm font-bold", isDarkTheme ? "text-white/80" : "text-black/80")}>
                                        Разрешение
                                    </label>
                                    <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-600/10 px-3 py-1 rounded-full">
                                        {config.size}x{config.size} px
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="200"
                                    max="1000"
                                    step="50"
                                    value={config.size}
                                    onChange={(e) => setConfig({ size: Number(e.target.value) })}
                                    className={cn(
                                        "w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none accent-indigo-600",
                                        isDarkTheme ? "bg-white/10" : "bg-black/5"
                                    )}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
