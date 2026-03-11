import { useEffect, useState, memo, useMemo } from 'react';
import { useQR } from '../../hooks/useQR';
import { cn } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Settings2, Link as LinkIcon, Wifi, Type, Phone, Mail, MessageCircle } from 'lucide-react';

const QUICK_LINKS = [
    { label: 'Telegram', value: 'https://t.me/' },
    { label: 'VK', value: 'https://vk.com/' },
    { label: 'YouTube', value: 'https://youtube.com/' },
    { label: 'WhatsApp', value: 'https://wa.me/' },
];

const InputField = memo(({ label, valueKey, type = "text", placeholder, isTextarea = false, className = "", config, setConfig, isDarkTheme }) => {
    const commonClasses = cn(
        "w-full px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all placeholder:opacity-40 text-base",
        isDarkTheme
            ? "bg-white/5 border border-white/10 text-white focus:bg-white/10"
            : "bg-white border border-black/5 text-black focus:border-indigo-500/30 shadow-sm",
        className
    );

    return (
        <div className="w-full">
            <label className={cn("block text-sm font-medium mb-2.5 ml-1", isDarkTheme ? "text-white/50" : "text-black/50")}>
                {label}
            </label>
            {isTextarea ? (
                <textarea
                    value={config[valueKey] || ''}
                    onChange={(e) => setConfig({ [valueKey]: e.target.value })}
                    className={cn(commonClasses, "min-h-[120px] resize-none")}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type={type}
                    value={config[valueKey] || ''}
                    onChange={(e) => setConfig({ [valueKey]: e.target.value })}
                    className={commonClasses}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
});
InputField.displayName = 'InputField';

const DetectionBadge = ({ type }) => {
    const types = {
        url: { label: 'Ссылка', icon: LinkIcon, color: 'text-blue-500 bg-blue-500/10' },
        wifi: { label: 'Wi-Fi', icon: Wifi, color: 'text-orange-500 bg-orange-500/10' },
        tel: { label: 'Телефон', icon: Phone, color: 'text-green-500 bg-green-500/10' },
        email: { label: 'Email', icon: Mail, color: 'text-purple-500 bg-purple-500/10' },
        sms: { label: 'SMS', icon: MessageCircle, color: 'text-pink-500 bg-pink-500/10' },
        text: { label: 'Текст', icon: Type, color: 'text-gray-500 bg-gray-500/10' },
    };

    const info = types[type] || types.text;
    const Icon = info.icon;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", info.color)}
        >
            <Icon size={12} />
            <span>Распознано: {info.label}</span>
        </motion.div>
    );
};

export function InputPanel() {
    const { config, setConfig, isDarkTheme, currentDetectedType } = useQR();
    const [urlWarning, setUrlWarning] = useState('');

    const toggleMode = () => setConfig({ isSmartMode: !config.isSmartMode });

    useEffect(() => {
        if (!config.isSmartMode && config.activeTab === 'url' && /^https?:\/\//i.test(config.content)) {
            try {
                new URL(config.content);
                setUrlWarning('');
            } catch (e) {
                setUrlWarning('Кажется, в ссылке есть опечатка');
            }
        } else {
            setUrlWarning('');
        }
    }, [config.content, config.activeTab, config.isSmartMode]);

    const animationVariants = {
        initial: { opacity: 0, scale: 0.98, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98, y: -10 },
        transition: { type: "spring", stiffness: 300, damping: 25 }
    };

    const inputProps = { config, setConfig, isDarkTheme };

    return (
        <div className="space-y-6">
            {/* Toggle Mode */}
            <div className="flex justify-center">
                <div className={cn(
                    "flex p-1 rounded-2xl border",
                    isDarkTheme ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
                )}>
                    <button
                        onClick={() => setConfig({ isSmartMode: true })}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                            config.isSmartMode 
                                ? (isDarkTheme ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-indigo-600 shadow-sm")
                                : "text-gray-500 hover:text-gray-400"
                        )}
                    >
                        <Sparkles size={16} /> Умный ввод
                    </button>
                    <button
                        onClick={() => setConfig({ isSmartMode: false })}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                            !config.isSmartMode 
                                ? (isDarkTheme ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-indigo-600 shadow-sm")
                                : "text-gray-500 hover:text-gray-400"
                        )}
                    >
                        <Settings2 size={16} /> Ручная настройка
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {config.isSmartMode ? (
                    <motion.div key="smart" {...animationVariants} className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={config.smartInput || ''}
                                onChange={(e) => setConfig({ smartInput: e.target.value })}
                                className={cn(
                                    "w-full px-6 py-8 rounded-[2rem] min-h-[180px] text-xl font-medium outline-none transition-all placeholder:opacity-30 resize-none border-2",
                                    isDarkTheme
                                        ? "bg-white/5 border-white/5 focus:border-indigo-500/50 text-white"
                                        : "bg-white border-black/5 focus:border-indigo-500/30 text-black shadow-sm"
                                )}
                                placeholder="Вставьте ссылку, номер или текст..."
                            />
                            <div className="absolute top-4 right-4 focus-within:opacity-100 transition-opacity">
                                <DetectionBadge type={currentDetectedType} />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="manual" {...animationVariants} className="space-y-6">
                        {config.activeTab === 'url' && (
                            <motion.div key="url" className="space-y-4">
                                <InputField
                                    label="Ссылка на сайт или профиль"
                                    valueKey="content"
                                    placeholder="https://t.me/denis_k"
                                    className={urlWarning ? 'border-orange-500/50 ring-orange-500/20' : ''}
                                    {...inputProps}
                                />
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_LINKS.map(link => (
                                        <button
                                            key={link.label}
                                            onClick={() => setConfig({ content: link.value })}
                                            className={cn(
                                                "px-4 py-2 text-xs font-bold rounded-xl transition-all border",
                                                isDarkTheme 
                                                    ? "bg-white/5 border-white/10 hover:bg-white/15 text-white/50 hover:text-white" 
                                                    : "bg-white border-black/5 hover:bg-gray-50 text-black/50 hover:text-indigo-600"
                                            )}
                                        >
                                            {link.label}
                                        </button>
                                    ))}
                                </div>
                                {urlWarning && <p className="text-sm text-orange-400 font-medium px-2">{urlWarning}</p>}
                            </motion.div>
                        )}

                        {config.activeTab === 'text' && (
                            <InputField label="Текстовое сообщение" valueKey="textContent" placeholder="Введите любой текст..." isTextarea {...inputProps} />
                        )}

                        {config.activeTab === 'wifi' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Имя сети (SSID)" valueKey="wifiSsid" placeholder="My Home Network" {...inputProps} />
                                    <div>
                                        <label className={cn("block text-sm font-medium mb-2.5 ml-1", isDarkTheme ? "text-white/50" : "text-black/50")}>
                                            Защита
                                        </label>
                                        <select
                                            value={config.wifiEncryption || 'WPA'}
                                            onChange={(e) => setConfig({ wifiEncryption: e.target.value })}
                                            className={cn(
                                                "w-full px-5 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer border",
                                                isDarkTheme 
                                                    ? "bg-white/5 border-white/10 text-white" 
                                                    : "bg-white border-black/5 text-black shadow-sm"
                                            )}
                                        >
                                            <option value="WPA" className={isDarkTheme ? "bg-gray-900" : "bg-white"}>WPA/WPA2</option>
                                            <option value="WEP" className={isDarkTheme ? "bg-gray-900" : "bg-white"}>WEP</option>
                                            <option value="nopass" className={isDarkTheme ? "bg-gray-900" : "bg-white"}>Открытая</option>
                                        </select>
                                    </div>
                                </div>
                                {config.wifiEncryption !== 'nopass' && (
                                    <InputField label="Пароль" valueKey="wifiPassword" type="password" placeholder="Ваш пароль к Wi-Fi" {...inputProps} />
                                )}
                            </div>
                        )}

                        {config.activeTab === 'vcard' && (
                            <div className="space-y-4">
                                <InputField label="Имя и Фамилия" valueKey="vcardName" placeholder="Иван Иванов" {...inputProps} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Номер телефона" valueKey="vcardPhone" type="tel" placeholder="+7 999 000 00 00" {...inputProps} />
                                    <InputField label="Электронная почта" valueKey="vcardEmail" type="email" placeholder="mail@example.com" {...inputProps} />
                                    <InputField label="Должность" valueKey="vcardTitle" placeholder="Директор" {...inputProps} />
                                    <InputField label="Компания" valueKey="vcardCompany" placeholder="ООО Ромашка" {...inputProps} />
                                    <div className="md:col-span-2">
                                        <InputField label="Сайт / Портфолио" valueKey="vcardWebsite" placeholder="https://example.com" {...inputProps} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {config.activeTab === 'event' && (
                            <div className="space-y-4">
                                <InputField label="Название события" valueKey="eventTitle" placeholder="Встреча, День Рождения..." {...inputProps} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Начало" valueKey="eventStart" type="datetime-local" {...inputProps} />
                                    <InputField label="Конец" valueKey="eventEnd" type="datetime-local" {...inputProps} />
                                </div>
                                <InputField label="Место проведения" valueKey="eventLocation" placeholder="Москва, ул. Пушкина, 1" {...inputProps} />
                                <InputField label="Описание" valueKey="eventDescription" placeholder="Детали мероприятия..." isTextarea {...inputProps} />
                            </div>
                        )}

                        {config.activeTab === 'email' && (
                            <div className="space-y-4">
                                <InputField label="Кому (Email)" valueKey="emailTo" type="email" placeholder="hello@company.com" {...inputProps} />
                                <InputField label="Тема письма" valueKey="emailSubject" placeholder="Вопрос по проекту" {...inputProps} />
                                <InputField label="Текст письма" valueKey="emailBody" placeholder="Здравствуйте..." isTextarea {...inputProps} />
                            </div>
                        )}

                        {config.activeTab === 'sms' && (
                            <div className="space-y-4">
                                <InputField label="Номер телефона" valueKey="smsPhone" type="tel" placeholder="+7 999 123 45 67" {...inputProps} />
                                <InputField label="Сообщение" valueKey="smsText" placeholder="Привет! Я по поводу..." isTextarea {...inputProps} />
                            </div>
                        )}

                        {config.activeTab === 'geo' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Широта (Latitude)" valueKey="geoLat" type="number" placeholder="55.7558" {...inputProps} />
                                <InputField label="Долгота (Longitude)" valueKey="geoLng" type="number" placeholder="37.6173" {...inputProps} />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
