import { useEffect, useState } from 'react';
import { QRProvider } from './hooks/QRProvider';
import { useQR } from './hooks/useQR';
import { useQRApi } from './hooks/useQRApi';
import { AchievementsProvider, useAchievements } from './hooks/useAchievements';
import { cn } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { Header } from './components/Header';
import { Tabs } from './components/ControlPanel/Tabs';
import { InputPanel } from './components/ControlPanel/InputPanel';
import { PresetsGallery } from './components/ControlPanel/PresetsGallery';
import { ColorPicker } from './components/ControlPanel/ColorPicker';
import { OptionsDrawer } from './components/ControlPanel/OptionsDrawer';
import { LogoUpload } from './components/ControlPanel/LogoUpload';
import { QRPreview } from './components/QRPreview';
import { HistoryRibbon } from './components/HistoryRibbon';
import { CustomSelect } from './components/CustomSelect';

const formatOptions = [
    { value: 'png', label: 'PNG' },
    { value: 'svg', label: 'SVG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'webp', label: 'WEBP' }
];

const sizeOptions = [
    { value: 1, label: '300px' },
    { value: 2, label: '600px' },
    { value: 4, label: '1200px' },
    { value: 8, label: '2400px' }
];
import { ErrorBoundary } from './components/ErrorBoundary';
import { Download, Save, Copy, Check, Wand2, History } from 'lucide-react';

function MainApp() {
  const {
    isDarkTheme,
    config,
    currentQrData,
    qrInstance,
    isLoading,
    setIsLoading,
    fetchDbHistory,
    history
  } = useQR();

  const { saveToHistory: _saveAPI } = useQRApi();
  const { unlockAchievement } = useAchievements();

  const [exportFormat, setExportFormat] = useState('png');
  const [exportSize, setExportSize] = useState(1); // multiplier
  const [isCopied, setIsCopied] = useState(false);
  const [activeView, setActiveView] = useState('editor'); // 'editor' | 'history'
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [successEvent, setSuccessEvent] = useState(null); // 'save' | 'download' | null

  const themeClasses = isDarkTheme
    ? {
      bg: 'bg-midnight text-white selection:bg-indigo-500/30',
      cardBd: 'bg-[#0a0a0a]/60 border border-white/10 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]',
      ambient: 'from-indigo-950/40 via-[#050505] to-purple-950/30'
    }
    : {
      bg: 'bg-gray-50 text-gray-900 selection:bg-indigo-500/20',
      cardBd: 'bg-white/70 border border-black/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
      ambient: 'from-indigo-100/50 via-white to-fuchsia-100/30'
    };

  const handleSaveToHistory = async () => {
    try {
      await _saveAPI();
      unlockAchievement('FIRST_QR');
      if (history.length >= 9) {
        unlockAchievement('QR_MASTER');
      }

      // Trigger premium success toast notification
      setSuccessEvent('save');
      setTimeout(() => setSuccessEvent(null), 3000);
      
    } catch (err) {
      alert(err.message);
    }
  };

  // Watch for configuration changes to unlock achievements
  useEffect(() => {
    if (config.useGradient && config.colorDark !== '#0a0a0a') {
      unlockAchievement('CUSTOMIZER');
    }
    if (config.logoBase64) {
      unlockAchievement('LOGO_USER');
    }
  }, [config, unlockAchievement]);

  const copyToClipboard = async () => {
    if (!qrInstance) return;
    try {
      // Get raw data Blob
      const qrBlob = await qrInstance.getRawData('png');
      // Create a Blob from the ArrayBuffer view to pass to ClipboardItem
      const blob = new Blob([qrBlob], { type: 'image/png' });
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      // Fallback or alert for unsupported browsers
      alert('Не удалось скопировать в буфер обмена. Попробуйте скачать файл.');
    }
  };

    const [hasDownloaded, setHasDownloaded] = useState(false);

    const downloadQr = async () => {
        if (!qrInstance) return;
        
        // Generate formatting: qr_studio_YYYYMMDD_HHMMSS
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const fileName = `qr_studio_${year}${month}${day}_${hours}${minutes}${seconds}`;

        // Temporarily update size and dynamically scale margin for high-res download
        const originalSize = config.size;
        
        // Update instance for high res export (scale margin too so it doesn't thin out)
        qrInstance.update({ 
            width: originalSize * exportSize, 
            height: originalSize * exportSize,
            margin: 10 * exportSize
        });

        try {
            // CRITICAL: Yield to the browser event loop! 
            // qr-code-styling takes a few milliseconds to repaint the canvas at the new, 
            // heavier resolution. If we download immediately synchronously, we just extract 
            // the old 300px canvas. Wait 300ms to guarantee full repaint!
            await new Promise(resolve => setTimeout(resolve, 300));

            // Now download from the freshly painted high-res canvas
            await qrInstance.download({ name: fileName, extension: exportFormat });
            
            // Trigger premium success toast notification
            setSuccessEvent('download');
            setTimeout(() => setSuccessEvent(null), 3000);
        } catch (err) {
            console.error("Failed to download QR code", err);
        } finally {
            // Immediately restore size and original margin for UI preview
            qrInstance.update({ 
                width: originalSize, 
                height: originalSize,
                margin: 10
            });
        }
    };

  return (
    <div className={cn("min-h-screen transition-colors duration-700 font-sans flex flex-col relative overflow-hidden", themeClasses.bg)}>
      {/* Ambient background blur */}
      <div className={cn("absolute inset-0 bg-gradient-to-br -z-10", themeClasses.ambient)} />

      {/* Grainy Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-noise opacity-[0.03]" />

      {/* Animated Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
            animate={{ 
                x: [0, 80, 0], 
                y: [0, 40, 0],
                rotate: [0, 90, 0],
                scale: [1, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-[0.15] bg-indigo-600/40"
        />
        <motion.div
            animate={{ 
                x: [0, -60, 0], 
                y: [0, -30, 0],
                rotate: [0, -45, 0],
                scale: [1, 1.2, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-[0.1] bg-purple-600/30"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[150px] opacity-[0.05] bg-blue-500/20" />
      </div>

      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 mb-8">
        {/* Left Side: Control Panel */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.3 }
            }
          }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            className={cn("p-4 md:p-6 rounded-[2.5rem] space-y-8 flex-grow flex flex-col", themeClasses.cardBd)}
          >
            {/* View Segmented Control */}
            <div className={cn("flex p-1.5 rounded-2xl mb-2 shrink-0 border backdrop-blur-md relative", isDarkTheme ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5")}>
              <button
                onClick={() => {
                    setActiveView('editor');
                    setSelectedHistoryItem(null);
                }}
                className={cn("flex-1 flex gap-2 justify-center items-center py-3 text-sm font-bold rounded-xl transition-colors relative z-10", activeView === 'editor' ? (isDarkTheme ? "text-white" : "text-indigo-600") : (isDarkTheme ? "text-white/40 hover:text-white/80" : "text-black/40 hover:text-black/80"))}
              >
                {activeView === 'editor' && (
                  <motion.div
                    layoutId="activeViewIndicator"
                    className={cn("absolute inset-0 rounded-xl -z-10", isDarkTheme ? "bg-indigo-600 shadow-lg shadow-indigo-600/30" : "bg-white shadow-md border border-black/5")}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Wand2 size={18} /> Создание
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={cn("flex-1 flex gap-2 justify-center items-center py-3 text-sm font-bold rounded-xl transition-colors relative z-10", activeView === 'history' ? (isDarkTheme ? "text-white" : "text-indigo-600") : (isDarkTheme ? "text-white/40 hover:text-white/80" : "text-black/40 hover:text-black/80"))}
              >
                {activeView === 'history' && (
                  <motion.div
                    layoutId="activeViewIndicator"
                    className={cn("absolute inset-0 rounded-xl -z-10", isDarkTheme ? "bg-indigo-600 shadow-lg shadow-indigo-600/30" : "bg-white shadow-md border border-black/5")}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <History size={18} /> История
              </button>
            </div>

            {activeView === 'editor' ? (
              <div className="space-y-4 flex-grow animate-fade-in no-scrollbar">
                <Tabs />
                <div className="space-y-2">
                  {[
                    <InputPanel key="input" />,
                    <div key="sep2" className={cn("h-px w-full opacity-50", isDarkTheme ? "bg-white/10" : "bg-black/5")} />,
                    <PresetsGallery key="presets" />,
                    <div key="sep3" className={cn("h-px w-full opacity-50", isDarkTheme ? "bg-white/10" : "bg-black/5")} />,
                    <ColorPicker key="colors" />,
                    <div key="sep4" className={cn("h-px w-full opacity-50", isDarkTheme ? "bg-white/10" : "bg-black/5")} />,
                    <OptionsDrawer key="options" />,
                    <div key="sep5" className={cn("h-px w-full opacity-50", isDarkTheme ? "bg-white/10" : "bg-black/5")} />,
                    <LogoUpload key="logo" />
                  ].map((child, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      {child}
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-grow animate-fade-in h-[600px] overflow-hidden">
                <ErrorBoundary fallback={<div className="w-full p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-bold">Не удалось загрузить историю.</div>}>
                  <HistoryRibbon onSelectHistoryItem={setSelectedHistoryItem} />
                </ErrorBoundary>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Right Side: QR Preview & Actions (Sticky) */}
        <div className="lg:col-span-7 flex flex-col gap-8 lg:sticky lg:top-8 self-start">
          <QRPreview activeView={activeView} selectedHistoryItem={selectedHistoryItem} />

          {((activeView === 'editor' && currentQrData && currentQrData.trim() !== '') || (activeView === 'history' && selectedHistoryItem)) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn("p-6 md:p-8 rounded-[2.5rem] flex flex-col gap-6 group", themeClasses.cardBd)}
            >
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex gap-3 w-full md:w-auto">
                <CustomSelect 
                  value={exportFormat} 
                  onChange={setExportFormat} 
                  options={formatOptions} 
                  isDarkTheme={isDarkTheme} 
                  className="flex-1 md:flex-none" 
                />
                <CustomSelect 
                  value={exportSize} 
                  onChange={setExportSize} 
                  options={sizeOptions} 
                  isDarkTheme={isDarkTheme} 
                  className="flex-1 md:flex-none" 
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={copyToClipboard} 
                  className={cn("flex-1 md:flex-none py-3 px-8 rounded-2xl text-sm font-bold transition-all border flex items-center justify-center gap-2", isCopied ? "bg-green-500 text-white border-green-400" : isDarkTheme ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-white hover:bg-gray-50 border-black/5 text-black shadow-sm")}
                >
                  {isCopied ? <Check size={18} /> : <Copy size={18} />}
                  Копировать
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={downloadQr} 
                  className={cn("flex-1 md:flex-none py-3 px-8 rounded-2xl text-sm font-extrabold transition-all flex items-center justify-center gap-2", isDarkTheme ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900 shadow-xl shadow-black/10")}
                >
                  <Download size={18} />
                  Скачать
                </motion.button>
              </div>
            </div>

            {activeView === 'editor' && (
              <>
                <div className={cn("h-px w-full opacity-50", isDarkTheme ? "bg-white/10" : "bg-black/5")} />

                <motion.button 
                  whileHover={isLoading ? {} : { scale: 1.01, y: -2 }}
                  whileTap={isLoading ? {} : { scale: 0.98 }}
                  onClick={handleSaveToHistory} 
                  disabled={isLoading} 
                  className={cn("w-full py-5 px-8 rounded-[2rem] text-lg font-black transition-colors duration-500 flex items-center justify-center gap-3 relative overflow-hidden group/save", isLoading ? "bg-gray-500/20 cursor-not-allowed text-white/20" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50")}
                >
                  <Save size={24} className={isLoading ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
                  {isLoading ? 'Сохранение...' : 'Сохранить QR-код'}
                </motion.button>
              </>
            )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Premium Success Toast Notification */}
      <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center pointer-events-none">
        <AnimatePresence>
          {successEvent && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn("pointer-events-auto px-6 py-4 rounded-3xl flex items-center gap-4 backdrop-blur-2xl border shadow-2xl",
                isDarkTheme 
                  ? "bg-[#111]/80 border-white/10 text-white shadow-black/80" 
                  : "bg-white/90 border-black/5 text-slate-900 shadow-xl shadow-black/5"
              )}
            >
              <motion.div 
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                className={cn("p-2 rounded-full", isDarkTheme ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600")}
              >
                  <Check size={20} strokeWidth={3} />
              </motion.div>
              <div className="flex flex-col pr-4">
                  <span className="text-[15px] font-black tracking-tight leading-tight">Успешно!</span>
                  <span className={cn("text-xs font-semibold", isDarkTheme ? "text-white/60" : "text-black/50")}>
                      {successEvent === 'save' ? 'QR-код сохранён в историю' : 'QR-код загружен на устройство'}
                  </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AchievementsProvider>
      <QRProvider>
        <MainApp />
      </QRProvider>
    </AchievementsProvider>
  );
}
