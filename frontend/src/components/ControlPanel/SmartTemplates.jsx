import { useQR } from '../../hooks/useQR';
import { cn } from '../../utils';
import { Briefcase, Utensils, CalendarHeart, Zap } from 'lucide-react';

const SMART_TEMPLATES = [
    {
        name: 'Визитка (vCard)',
        icon: Briefcase,
        description: 'Строгий и стильный дизайн для обмена контактами',
        config: {
            activeTab: 'vcard',
            colorDark: '#0f172a',    // slate-900
            useGradient: true,
            gradientType: 'linear',
            colorGradient2: '#334155', // slate-700
            colorLight: '#f8fafc',   // slate-50
            dotsType: 'classy',
            cornersSquareType: 'extra-rounded',
            cornersDotType: 'dot'
        }
    },
    {
        name: 'Меню Ресторана',
        icon: Utensils,
        description: 'Элегантный золотой градиент для меню',
        config: {
            activeTab: 'url',
            colorDark: '#451a03',    // amber-950
            useGradient: true,
            gradientType: 'radial',
            colorGradient2: '#b45309', // amber-600
            colorLight: '#fffbeb',   // amber-50
            dotsType: 'classy-rounded',
            cornersSquareType: 'rounded',
            cornersDotType: 'dot'
        }
    },
    {
        name: 'Приглашение',
        icon: CalendarHeart,
        description: 'Нежный дизайн для свадеб и мероприятий',
        config: {
            activeTab: 'event',
            colorDark: '#831843',    // pink-900
            useGradient: true,
            gradientType: 'linear',
            colorGradient2: '#db2777', // pink-600
            colorLight: '#fdf2f8',   // pink-50
            dotsType: 'rounded',
            cornersSquareType: 'extra-rounded',
            cornersDotType: 'dot'
        }
    }
];

export function SmartTemplates() {
    const { setConfig, isDarkTheme } = useQR();

    return (
        <div className="space-y-3">
            <h3 className={cn("text-sm font-semibold flex items-center gap-2", isDarkTheme ? "text-white" : "text-black/80")}>
                <Zap size={16} className="text-yellow-500" /> Смарт-шаблоны
            </h3>

            <div className="flex flex-col gap-2">
                {SMART_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    return (
                        <button
                            key={template.name}
                            onClick={() => setConfig(template.config)}
                            className={cn(
                                "flex items-center gap-3 w-full p-3 rounded-xl transition-all border text-left group",
                                isDarkTheme 
                                    ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30" 
                                    : "bg-white/60 border-black/10 hover:bg-white hover:border-black/30 shadow-sm"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                isDarkTheme ? "bg-white/10 text-white" : "bg-black/5 text-black"
                            )}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <h4 className={cn("text-sm font-bold", isDarkTheme ? "text-white" : "text-black")}>
                                    {template.name}
                                </h4>
                                <p className={cn("text-[10px]", isDarkTheme ? "text-white/60" : "text-black/60")}>
                                    {template.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
