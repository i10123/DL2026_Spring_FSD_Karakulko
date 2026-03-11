import { useState, useRef, useEffect } from 'react';
import { useQR } from '../hooks/useQR';
import { cn } from '../utils';
import { Sun, Moon } from 'lucide-react';

export function Header() {
    const { 
        isDarkTheme, setIsDarkTheme, 
        undo, redo, canUndo, canRedo
    } = useQR();

    return (
        <header className="p-6 flex justify-between items-center w-full max-w-7xl mx-auto z-10 relative">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    QR Студия Pro
                </span>
            </h1>

            <div className="flex items-center gap-3">



                {/* Theme Toggle */}
                <button
                    onClick={() => setIsDarkTheme(!isDarkTheme)}
                    className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md border transition-all hover:scale-105",
                        isDarkTheme
                            ? "bg-white/10 border-white/20 hover:bg-white/20 text-yellow-300"
                            : "bg-white border-black/10 hover:bg-gray-100 text-indigo-900 shadow-sm"
                    )}
                    title="Сменить тему"
                    aria-label="Сменить тему"
                >
                    {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </header>
    );
}
