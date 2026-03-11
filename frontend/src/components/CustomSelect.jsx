import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils';

export function CustomSelect({ value, onChange, options, isDarkTheme, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    // Get the label for the currently selected value
    const selectedLabel = options.find(opt => opt.value === value)?.label || value;

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={selectRef} className={cn("relative min-w-[120px]", className)}>
            {/* Main Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full px-5 py-3 rounded-2xl text-sm font-bold transition-all border flex items-center justify-between gap-3 shadow-sm active:scale-95",
                    isDarkTheme 
                        ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" 
                        : "bg-white border-black/5 hover:bg-gray-50 text-black",
                    isOpen && (isDarkTheme ? "border-white/20 bg-white/10" : "border-black/10 shadow-md bg-gray-50")
                )}
            >
                <span className="truncate">{selectedLabel}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <ChevronDown size={16} className={isDarkTheme ? "text-white/50" : "text-black/40"} />
                </motion.div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 4 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={cn(
                            "absolute bottom-[calc(100%+8px)] sm:bottom-auto sm:top-full z-[100] w-full mt-2 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl origin-bottom sm:origin-top",
                            isDarkTheme 
                                ? "bg-[#1f1f1f]/90 border-white/10 shadow-black/80" 
                                : "bg-white/90 border-black/5 shadow-black/10"
                        )}
                    >
                        <div className="flex flex-col p-1.5 gap-0.5">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between",
                                        value === opt.value
                                            ? (isDarkTheme ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600")
                                            : (isDarkTheme ? "text-white/70 hover:bg-white/5 hover:text-white" : "text-black/70 hover:bg-black/5 hover:text-black")
                                    )}
                                >
                                    {opt.label}
                                    {/* Optional checked state indicator */}
                                    {value === opt.value && (
                                        <motion.div layoutId={`check-${options[0].value}`}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", isDarkTheme ? "bg-indigo-400" : "bg-indigo-500")} />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
