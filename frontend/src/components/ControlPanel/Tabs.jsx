import { motion } from 'framer-motion';
import { useQR } from '../../hooks/useQR';
import { Link, Wifi, Type, Contact, Calendar, Mail, MessageCircle, MapPin } from 'lucide-react';
import { cn } from '../../utils';

const tabs = [
    { id: 'url', name: 'Ссылка', icon: Link },
    { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
    { id: 'text', name: 'Текст', icon: Type },
    { id: 'vcard', name: 'Визитка', icon: Contact },
    { id: 'event', name: 'Событие', icon: Calendar },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'sms', name: 'SMS', icon: MessageCircle },
    { id: 'geo', name: 'Локация', icon: MapPin }
];

export function Tabs() {
    const { config: { activeTab }, setConfig, isDarkTheme } = useQR();
    return (
        <div className="w-full relative">
            <div className={cn(
                "grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 rounded-2xl backdrop-blur-md border",
                isDarkTheme ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
            )}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setConfig({ activeTab: tab.id })}
                            className={cn(
                                "relative z-10 flex items-center justify-center gap-1.5 py-3 px-2 text-[13px] font-bold rounded-xl transition-all duration-300",
                                isActive
                                    ? (isDarkTheme ? "text-white" : "text-indigo-600")
                                    : (isDarkTheme ? "text-white/40 hover:text-white/70" : "text-black/40 hover:text-black/70")
                            )}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab"
                                    className={cn(
                                        "absolute inset-0 rounded-xl -z-10",
                                        isDarkTheme ? "bg-indigo-600 shadow-lg shadow-indigo-600/30" : "bg-white shadow-md border border-black/5"
                                    )}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon size={16} className={cn("shrink-0 transition-opacity", isActive ? "opacity-100" : "opacity-40")} />
                            <span className="whitespace-nowrap">{tab.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
