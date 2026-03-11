import { useQR } from '../../hooks/useQR';
import { cn } from '../../utils';
import { Sparkles, Palette } from 'lucide-react';

const PRESETS = [
    {
        name: 'Monochrome',
        config: {
            colorDark: '#171717',
            useGradient: false,
            colorLight: '#f5f5f5',
            dotsType: 'classy',
            cornersSquareType: 'extra-rounded',
            cornersDotType: 'dot'
        }
    },
    {
        name: 'Duotone Purple',
        config: {
            colorDark: '#4c1d95',
            useGradient: true,
            gradientType: 'linear',
            colorGradient2: '#db2777',
            colorLight: '#fdf4ff',
            dotsType: 'rounded',
            cornersSquareType: 'extra-rounded',
            cornersDotType: 'dot'
        }
    },
    {
        name: 'Ocean Triad',
        config: {
            colorDark: '#0369a1',
            useGradient: true,
            gradientType: 'radial',
            colorGradient2: '#0d9488',
            colorLight: '#f0fdfa',
            dotsType: 'classy',
            cornersSquareType: 'extra-rounded',
            cornersDotType: 'dot'
        }
    },
    {
        name: 'Neon Cyber',
        config: {
            colorDark: '#0f0f13',
            useGradient: true,
            gradientType: 'linear',
            colorGradient2: '#6800e6',
            colorLight: '#00ffcc',
            dotsType: 'rounded',
            cornersSquareType: 'extra-rounded',
            cornersDotType: 'dot'
        }
    },
    {
        name: 'Gold Luxury',
        config: {
            colorDark: '#362204',
            useGradient: true,
            gradientType: 'radial',
            colorGradient2: '#8a6300',
            colorLight: '#fdfbf7',
            dotsType: 'classy-rounded',
            cornersSquareType: 'extra-rounded',
            cornersDotType: 'dot'
        }
    },
    {
        name: 'Forest Analogous',
        config: {
            colorDark: '#14532d',
            useGradient: true,
            gradientType: 'linear',
            colorGradient2: '#65a30d',
            colorLight: '#f7fee7',
            dotsType: 'extra-rounded',
            cornersSquareType: 'dot',
            cornersDotType: 'square'
        }
    }
];

export function PresetsGallery() {
    const { setConfig, isDarkTheme } = useQR();

    return (
        <div className="space-y-3">
            <h3 className={cn("text-sm font-semibold flex items-center gap-2", isDarkTheme ? "text-white" : "text-black/80")}>
                <Palette size={16} /> Цветовые схемы & Пресеты
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.name}
                        onClick={() => setConfig(preset.config)}
                        className={cn(
                            "relative group overflow-hidden rounded-xl p-3 text-left transition-all border flex flex-col justify-between h-20",
                            isDarkTheme ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30" : "bg-white/80 border-black/10 hover:bg-white hover:border-black/30 shadow-sm"
                        )}
                    >
                        {/* Abstract preview indicator */}
                        <div className="w-full flex gap-1 mb-2">
                            <div className="h-3 flex-1 rounded-sm shadow-sm" style={{ background: preset.config.useGradient ? `linear-gradient(to right, ${preset.config.colorDark}, ${preset.config.colorGradient2})` : preset.config.colorDark }} />
                            <div className="w-3 h-3 rounded-sm shadow-sm border border-white/20" style={{ background: preset.config.colorLight }} />
                        </div>

                        <p className={cn("text-[10px] font-semibold uppercase tracking-wide truncate w-full", isDarkTheme ? "text-white/80" : "text-black/80")}>
                            {preset.name}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
