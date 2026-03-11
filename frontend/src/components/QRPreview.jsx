import { useEffect, useRef, useState, useMemo } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { useQR } from '../hooks/useQR';
import { INITIAL_CONFIG } from '../hooks/QRProvider';
import { useDebounce } from 'use-debounce';
import { cn } from '../utils';
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
import { Wand2 } from 'lucide-react';

export function QRPreview({ activeView = 'editor', selectedHistoryItem = null }) {
    const { config, currentQrData, isDarkTheme, setQrInstance } = useQR();
    const [error, setError] = useState('');

    const qrRef = useRef(null);
    const qrCode = useRef(null);
    const containerRef = useRef(null);

    // Modern Premium 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const isHovered = useMotionValue(0);

    const springConfig = { stiffness: 400, damping: 40 };
    const mouseXSpring = useSpring(x, springConfig);
    const mouseYSpring = useSpring(y, springConfig);
    const hoverSpring = useSpring(isHovered, springConfig);

    // Subtle rotation angles
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
    
    // Dynamic Scale
    const scale = useTransform(hoverSpring, [0, 1], [1, 1.04]);

    // Dynamic Glare
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
    const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.5) 0%, transparent 60%)`;
    const glareOpacity = useTransform(hoverSpring, [0, 1], [0, 1]);

    // Dynamic Shadow
    const shadowX = useTransform(mouseXSpring, [-0.5, 0.5], [20, -20]);
    const shadowY = useTransform(mouseYSpring, [-0.5, 0.5], [20, -20]);
    const dynamicShadow = useMotionTemplate`${shadowX}px ${shadowY}px 50px ${isDarkTheme ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.12)'}`;

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseEnter = () => {
        isHovered.set(1);
    };

    const handleMouseLeave = () => {
        isHovered.set(0);
        x.set(0);
        y.set(0);
    };

    // Use debounce on the config values that affect rendering
    const [debouncedConfig] = useDebounce(config, 300);
    const [debouncedData] = useDebounce(currentQrData, 300);

    // Derive the config and data to display based on activeView
    const previewData = useMemo(() => {
        if (activeView === 'history') {
            return selectedHistoryItem ? selectedHistoryItem.content : '';
        }
        return debouncedData;
    }, [activeView, selectedHistoryItem, debouncedData]);

    const previewConfig = useMemo(() => {
        if (activeView === 'history' && selectedHistoryItem) {
            const isOldDefaultDark = selectedHistoryItem.design?.colorDark === '#ffffff' && selectedHistoryItem.design?.colorLight === '#0a0a0a';
            return {
                ...INITIAL_CONFIG, // Ensure we have base defaults
                ...selectedHistoryItem.design,
                colorDark: isOldDefaultDark ? '#0a0a0a' : (selectedHistoryItem.design?.colorDark || '#0a0a0a'),
                colorLight: isOldDefaultDark ? '#ffffff' : (selectedHistoryItem.design?.colorLight || '#ffffff'),
                size: debouncedConfig.size // keep live scale size even for history preview so it matches layout
            };
        }
        return debouncedConfig;
    }, [activeView, selectedHistoryItem, debouncedConfig]);

    const utf8EncodedData = useMemo(() => {
        const dataToEncode = previewData || "https://example.com/empty-state";
        try {
            // Encode data to UTF-8 binary string to support Russian/Chinese characters.
            // Some scanners require a BOM for UTF-8 bytes to be recognized properly.
            const utf8Str = unescape(encodeURIComponent(dataToEncode));
            // Add BOM if non-ASCII characters are present
            if (/[^\u0000-\u007F]/.test(dataToEncode)) {
                return '\xEF\xBB\xBF' + utf8Str;
            }
            return utf8Str;
        } catch (e) {
            console.error('QR data encoding error', e);
            return dataToEncode;
        }
    }, [previewData]);

    // Initialize
    useEffect(() => {
        qrCode.current = new QRCodeStyling({
            width: 300,
            height: 300,
            margin: 10,
            type: 'svg',
            data: utf8EncodedData,
            image: previewConfig.logoBase64 || '',
            qrOptions: { errorCorrectionLevel: previewConfig.errorCorrectionLevel },
            dotsOptions: {
                type: previewConfig.dotsType,
                color: !previewConfig.useGradient ? previewConfig.colorDark : undefined,
                gradient: previewConfig.useGradient ? {
                    type: previewConfig.gradientType,
                    colorStops: [{ offset: 0, color: previewConfig.colorDark }, { offset: 1, color: previewConfig.colorGradient2 }]
                } : undefined
            },
            backgroundOptions: { color: previewConfig.colorLight, round: 0 },
            cornersSquareOptions: { color: previewConfig.colorDark, type: previewConfig.cornersSquareType },
            cornersDotOptions: { color: previewConfig.colorDark, type: previewConfig.cornersDotType },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: previewConfig.logoMargin,
                imageSize: previewConfig.logoSize
            }
        });

        if (qrRef.current) {
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        }

        // Save instance to context for download/save operations
        if (setQrInstance) {
            setQrInstance(qrCode.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setQrInstance]);

    // Update
    useEffect(() => {
        if (!qrCode.current) return;

        qrCode.current.update({
            width: previewConfig.size,
            height: previewConfig.size,
            margin: 10,
            data: utf8EncodedData,
            image: previewConfig.logoBase64 || '',
            qrOptions: { errorCorrectionLevel: previewConfig.errorCorrectionLevel },
            dotsOptions: {
                type: previewConfig.dotsType,
                color: !previewConfig.useGradient ? previewConfig.colorDark : undefined,
                gradient: previewConfig.useGradient ? {
                    type: previewConfig.gradientType,
                    colorStops: [{ offset: 0, color: previewConfig.colorDark }, { offset: 1, color: previewConfig.colorGradient2 }]
                } : undefined
            },
            backgroundOptions: { color: previewConfig.colorLight, round: 0 },
            cornersSquareOptions: { color: previewConfig.colorDark, type: previewConfig.cornersSquareType },
            cornersDotOptions: { color: previewConfig.colorDark, type: previewConfig.cornersDotType },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: previewConfig.logoMargin,
                imageSize: previewConfig.logoSize
            }
        });
    }, [previewConfig, utf8EncodedData]);

    return (
        <motion.div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1200 }}
            className={cn("p-6 md:p-12 rounded-[3.5rem] flex flex-col items-center justify-center min-h-[350px] lg:min-h-[500px] w-full relative overflow-hidden group transition-all duration-500",
                isDarkTheme ? "bg-white/5 border border-white/10" : "bg-white border border-black/5 shadow-2xl"
            )}
        >
            {/* Dynamic Background Glow */}
            <motion.div
                animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.05, 0.1, 0.05]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 blur-[100px] pointer-events-none"
                style={{ 
                    background: `radial-gradient(circle at center, ${previewConfig.colorDark} 0%, transparent 70%)` 
                }}
            />

            <motion.div 
                style={{ 
                    rotateX, 
                    rotateY, 
                    scale,
                    boxShadow: dynamicShadow,
                }}
                className={cn("relative z-10 rounded-[2rem] p-4 md:p-8 cursor-pointer overflow-hidden border transition-colors",
                    isDarkTheme ? "bg-[#0a0a0a]/80 border-white/10" : "bg-white border-black/5"
                )}
            >
                {/* Interactive Glare Layer */}
                <motion.div 
                    style={{ 
                        background: glareBackground,
                        opacity: glareOpacity
                    }}
                    className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay transition-opacity duration-300"
                />

                <div 
                    ref={qrRef} 
                    className={cn("rounded-2xl overflow-hidden relative z-10 shadow-inner transition-all duration-500", (!previewData || previewData.trim() === '') && "opacity-10 blur-md pointer-events-none grayscale")} 
                    style={{ 
                        backgroundColor: previewConfig.colorLight,
                        border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}
                />

                {(!previewData || previewData.trim() === '') && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-30 flex items-center justify-center flex-col gap-6 p-8 pointer-events-none"
                    >
                        <div className="relative">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
                            />
                            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center relative z-10 border shadow-2xl", isDarkTheme ? "bg-[#111] border-white/10" : "bg-white border-black/5")}>
                                <Wand2 className={cn("w-8 h-8", isDarkTheme ? "text-indigo-400" : "text-indigo-600")} />
                            </div>
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className={cn("text-xl font-black tracking-tight", isDarkTheme ? "text-white" : "text-black")}>
                                {activeView === 'history' ? "Выберите QR-код" : "Жду ваших идей"}
                            </h3>
                            <p className={cn("text-sm max-w-[200px] leading-relaxed", isDarkTheme ? "text-white/50" : "text-black/50")}>
                                {activeView === 'history' ? "Нажмите на QR-код из истории слева" : "Введите текст или ссылку для создания магии"}
                            </p>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {error && (
                <div className="absolute bottom-6 left-6 right-6 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-center backdrop-blur-md animate-slide-up">
                    {error}
                </div>
            )}
        </motion.div>
    );
}
