import { useState, useEffect, useRef, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';

function App() {
  // Tabs State
  const [activeTab, setActiveTab] = useState('url'); // 'url', 'wifi', 'text', 'vcard'

  // Common Content
  const [content, setContent] = useState('https://t.me/i10123');
  const [textContent, setTextContent] = useState('');

  // Wi-Fi State
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');

  // vCard State
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');

  // Styling Settings
  const [colorDark, setColorDark] = useState('#ffffff');
  const [useGradient, setUseGradient] = useState(false);
  const [gradientType, setGradientType] = useState('linear');
  const [colorGradient2, setColorGradient2] = useState('#4f46e5');
  const [colorLight, setColorLight] = useState('#0a0a0a');

  const [dotsType, setDotsType] = useState('rounded');
  const [cornersSquareType, setCornersSquareType] = useState('extra-rounded');
  const [cornersDotType, setCornersDotType] = useState('dot');
  const [logoBase64, setLogoBase64] = useState('');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('Q');

  const [size, setSize] = useState(300);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urlWarning, setUrlWarning] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const qrRef = useRef(null);
  const qrCode = useRef(null);

  // Helper to generate QR string based on active tab
  const getQrDataObj = () => {
    if (activeTab === 'url') return content || 'https://t.me/i10123';
    if (activeTab === 'text') return textContent || 'Текст';
    if (activeTab === 'wifi') {
      const escape = (str) => String(str).replace(/[\\;,":]/g, '\\$&');
      return `WIFI:T:${wifiEncryption};S:${escape(wifiSsid)};P:${escape(wifiPassword)};;`;
    }
    if (activeTab === 'vcard') {
      return `BEGIN:VCARD
VERSION:3.0
N:${vcardName};;;
FN:${vcardName}
TEL;TYPE=CELL:${vcardPhone}
EMAIL:${vcardEmail}
END:VCARD`;
    }
    return content;
  };

  const currentQrData = getQrDataObj();

  // Initialize qr-code-styling
  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'svg',
      data: currentQrData,
      image: logoBase64 || '',
      qrOptions: { errorCorrectionLevel },
      dotsOptions: {
        type: dotsType,
        color: !useGradient ? colorDark : undefined,
        gradient: useGradient ? {
          type: gradientType,
          colorStops: [{ offset: 0, color: colorDark }, { offset: 1, color: colorGradient2 }]
        } : undefined
      },
      backgroundOptions: { color: colorLight },
      cornersSquareOptions: { color: colorDark, type: cornersSquareType },
      cornersDotOptions: { color: colorDark, type: cornersDotType },
      imageOptions: { crossOrigin: 'anonymous', margin: 20 }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync settings to QR code (Real-time updates)
  useEffect(() => {
    if (!qrCode.current) return;

    const timerId = setTimeout(() => {
      qrCode.current.update({
        data: currentQrData,
        width: size,
        height: size,
        image: logoBase64 || '',
        imageOptions: { margin: 20 },
        qrOptions: { errorCorrectionLevel },
        dotsOptions: {
          type: dotsType,
          color: !useGradient ? colorDark : undefined,
          gradient: useGradient ? {
            type: gradientType,
            colorStops: [{ offset: 0, color: colorDark }, { offset: 1, color: colorGradient2 }]
          } : undefined
        },
        backgroundOptions: { color: colorLight },
        cornersSquareOptions: { color: colorDark, type: cornersSquareType },
        cornersDotOptions: { color: colorDark, type: cornersDotType },
      });
    }, 100);

    return () => clearTimeout(timerId);
  }, [currentQrData, colorDark, colorLight, dotsType, cornersSquareType, cornersDotType, size, logoBase64, useGradient, gradientType, colorGradient2, errorCorrectionLevel]);

  // URL Validation
  useEffect(() => {
    if (activeTab === 'url' && /^https?:\/\//i.test(content)) {
      try {
        new URL(content);
        setUrlWarning('');
      } catch (e) {
        setUrlWarning('Кажется, в ссылке есть опечатка');
      }
    } else {
      setUrlWarning('');
    }
  }, [content, activeTab]);

  // Fetch History
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3001/api/qr/history');
      if (!res.ok) throw new Error('Не удалось загрузить историю');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:3001/api/qr/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error('Не удалось удалить запись');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Вы уверены, что хотите полностью очистить историю?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/qr/clear`, { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setLogoBase64(event.target.result);
    reader.readAsDataURL(file);
  };

  const clearLogo = () => setLogoBase64('');

  // Apply Presets
  const applyPreset = (presetName) => {
    if (presetName === 'Neon') {
      setColorDark('#00ffcc');
      setUseGradient(false);
      setColorLight('#0a0a0a');
      setDotsType('rounded');
      setCornersSquareType('extra-rounded');
    } else if (presetName === 'Classic') {
      setColorDark('#000000');
      setUseGradient(false);
      setColorLight('#ffffff');
      setDotsType('square');
      setCornersSquareType('square');
      setCornersDotType('square');
    } else if (presetName === 'Soft') {
      setColorDark('#4f46e5');
      setUseGradient(false);
      setColorLight('#fefce8');
      setDotsType('dots');
      setCornersSquareType('dot');
      setCornersDotType('dot');
    }
  };

  // Save to DB
  const saveToHistory = async () => {
    if (activeTab === 'url' && !content.trim()) {
      setError('Введите ссылку для генерации');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const qrDataUrl = await qrCode.current.getRawData('png');
      const blob = new Blob([qrDataUrl]);

      const base64Url = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      const payload = {
        content: currentQrData,
        colorDark,
        colorLight,
        dotsType,
        cornersSquareType,
        cornersDotType,
        logoBase64: logoBase64 || undefined,
        qrCode: base64Url
      }

      const res = await fetch('http://localhost:3001/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка при сохранении QR-кода');
      }

      await fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQr = (ext = 'png') => {
    if (!qrCode.current) return;
    const date = new Date().toISOString().split('T')[0];
    const safeName = currentQrData.replace(/[^a-z0-9]/gi, '_').substring(0, 10);
    const fileName = `qr-${safeName || 'code'}-${date}.${ext}`;

    qrCode.current.download({ name: fileName, extension: ext });
  };

  // Theme Config
  const themeClasses = isDarkTheme
    ? {
      bg: 'bg-gradient-to-br from-gray-900 via-[#111] to-black text-white',
      cardBd: 'bg-white/5 border border-white/10 backdrop-blur-xl',
      input: 'bg-black/50 border border-white/20 text-white focus:ring-indigo-500',
      label: 'text-gray-300',
      historyCard: 'bg-white/5 border border-white/10 hover:bg-white/10',
      tabActive: 'bg-white/10 text-white border-white/20',
      tabInactive: 'text-gray-400 hover:text-gray-200'
    }
    : {
      bg: 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900',
      cardBd: 'bg-white/70 border border-black/5 backdrop-blur-xl shadow-2xl',
      input: 'bg-white/50 border border-gray-300 text-gray-900 focus:ring-indigo-500',
      label: 'text-gray-700',
      historyCard: 'bg-white border border-gray-200 hover:shadow-lg',
      tabActive: 'bg-white text-indigo-600 shadow-sm border-gray-200',
      tabInactive: 'text-gray-500 hover:text-gray-700'
    };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses.bg} font-sans flex flex-col`}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center w-full max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
          QR Студия Pro
        </h1>
        <button
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          className={`px-4 py-2 rounded-full backdrop-blur-md border transition-all ${isDarkTheme ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
        >
          {isDarkTheme ? '☀️ Светлая тема' : '🌙 Тёмная тема'}
        </button>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Bento: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className={`p-6 md:p-8 rounded-3xl ${themeClasses.cardBd} space-y-8 flex-grow`}>

            {/* Tabs */}
            <div className={`flex rounded-xl p-1 ${isDarkTheme ? 'bg-black/30 w-full' : 'bg-gray-200 w-full'}`}>
              {[
                { id: 'url', name: 'Ссылка' },
                { id: 'wifi', name: 'Wi-Fi' },
                { id: 'text', name: 'Текст' },
                { id: 'vcard', name: 'Визитка' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all border border-transparent ${activeTab === tab.id ? themeClasses.tabActive : themeClasses.tabInactive}`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Content Inputs based on Tab */}
            <div className="min-h-[90px] transition-all">
              {activeTab === 'url' && (
                <div className="animate-fade-in">
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>Ссылка</label>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all ${themeClasses.input} ${urlWarning ? 'border-orange-400 ring-orange-500/20' : ''}`}
                    placeholder="https://t.me/i10123"
                  />
                  {urlWarning && <p className="mt-2 text-xs text-orange-400 opacity-80">{urlWarning}</p>}
                </div>
              )}

              {activeTab === 'text' && (
                <div className="animate-fade-in">
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>Текст</label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className={`w-full h-24 px-4 py-3 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all resize-none ${themeClasses.input}`}
                    placeholder="Введите ваш текст..."
                  />
                </div>
              )}

              {activeTab === 'wifi' && (
                <div className="animate-fade-in space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Имя сети (SSID)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-xl outline-none ${themeClasses.input}`}
                        placeholder="MyWiFi"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Шифрование</label>
                      <select
                        value={wifiEncryption}
                        onChange={(e) => setWifiEncryption(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-xl appearance-none ${themeClasses.input}`}
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Без пароля</option>
                      </select>
                    </div>
                  </div>
                  {wifiEncryption !== 'nopass' && (
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Пароль</label>
                      <input
                        type="password"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-xl outline-none ${themeClasses.input}`}
                        placeholder="Пароль от сети"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'vcard' && (
                <div className="animate-fade-in space-y-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Имя / Компания</label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      className={`w-full px-3 py-2 text-sm rounded-xl outline-none ${themeClasses.input}`}
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Телефон</label>
                      <input
                        type="tel"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-xl outline-none ${themeClasses.input}`}
                        placeholder="+7 999 123 45 67"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Email</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-xl outline-none ${themeClasses.input}`}
                        placeholder="mail@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Presets */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${themeClasses.label}`}>Стили (Пресеты)</label>
              <div className="flex gap-2">
                {['Neon', 'Classic', 'Soft'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className={`flex-1 py-1.5 text-xs md:text-sm rounded-lg backdrop-blur-sm transition-transform hover:scale-105 ${isDarkTheme ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-black/5 border border-black/10 hover:bg-black/10'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors & Gradient */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className={`block text-xs font-medium ${themeClasses.label}`}>Настройки цвета</label>
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={useGradient} onChange={(e) => setUseGradient(e.target.checked)} className="rounded border-gray-400 text-indigo-600 focus:ring-indigo-500 bg-transparent" />
                  <span>Использовать градиент</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] uppercase mb-1 ${themeClasses.label}`}>Главный цвет</label>
                  <div className={`flex items-center rounded-xl px-2 py-1 h-9 ${themeClasses.input}`}>
                    <input
                      type="color"
                      value={colorDark}
                      onChange={(e) => setColorDark(e.target.value)}
                      className="w-8 h-8 rounded-md cursor-pointer bg-transparent border-0 shrink-0"
                    />
                    <span className="ml-2 text-xs font-mono uppercase opacity-70 truncate">{colorDark}</span>
                  </div>
                </div>
                {useGradient ? (
                  <div>
                    <label className={`block text-[10px] uppercase mb-1 ${themeClasses.label}`}>Второй цвет</label>
                    <div className={`flex items-center rounded-xl px-2 py-1 h-9 ${themeClasses.input}`}>
                      <input
                        type="color"
                        value={colorGradient2}
                        onChange={(e) => setColorGradient2(e.target.value)}
                        className="w-8 h-8 rounded-md cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <span className="ml-2 text-xs font-mono uppercase opacity-70 truncate">{colorGradient2}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={`block text-[10px] uppercase mb-1 ${themeClasses.label}`}>Цвет фона</label>
                    <div className={`flex items-center rounded-xl px-2 py-1 h-9 ${themeClasses.input}`}>
                      <input
                        type="color"
                        value={colorLight}
                        onChange={(e) => setColorLight(e.target.value)}
                        className="w-8 h-8 rounded-md cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <span className="ml-2 text-xs font-mono uppercase opacity-70 truncate">{colorLight}</span>
                    </div>
                  </div>
                )}
              </div>

              {useGradient && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] uppercase mb-1 ${themeClasses.label}`}>Тип градиента</label>
                    <select
                      value={gradientType}
                      onChange={(e) => setGradientType(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg appearance-none ${themeClasses.input}`}
                    >
                      <option value="linear">Ленейный (Linear)</option>
                      <option value="radial">Радиальный (Radial)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase mb-1 ${themeClasses.label}`}>Цвет фона</label>
                    <div className={`flex items-center rounded-lg px-2 py-0.5 h-7 ${themeClasses.input}`}>
                      <input type="color" value={colorLight} onChange={(e) => setColorLight(e.target.value)} className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 shrink-0" />
                      <span className="ml-2 text-[10px] font-mono uppercase opacity-70 truncate">{colorLight}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shape Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-2 ${themeClasses.label}`}>Стиль точек</label>
                <select
                  value={dotsType}
                  onChange={(e) => setDotsType(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl appearance-none ${themeClasses.input}`}
                >
                  <option value="rounded">Закругленный</option>
                  <option value="dots">Точки</option>
                  <option value="classy">Классический</option>
                  <option value="classy-rounded">Клас. закругленный</option>
                  <option value="square">Квадратный</option>
                  <option value="extra-rounded">Супер закругленный</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-2 ${themeClasses.label}`}>Стиль углов</label>
                <select
                  value={cornersSquareType}
                  onChange={(e) => setCornersSquareType(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl appearance-none ${themeClasses.input}`}
                >
                  <option value="rounded">Закругленный</option>
                  <option value="extra-rounded">Супер закругленный</option>
                  <option value="dot">Точка</option>
                  <option value="square">Квадрат</option>
                </select>
              </div>
            </div>

            {/* Advanced: Logo & Error Correction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-medium mb-2 ${themeClasses.label}`}>
                  Логотип
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoUpload}
                    className={`block w-full text-[10px] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${themeClasses.label}`}
                  />
                  {logoBase64 && (
                    <button onClick={clearLogo} className="text-xs text-red-500 hover:text-red-400 font-medium">✕</button>
                  )}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-2 ${themeClasses.label}`}>Уровень коррекции</label>
                <select
                  value={errorCorrectionLevel}
                  onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm rounded-lg appearance-none ${themeClasses.input}`}
                >
                  <option value="L">Низкий (L - 7%)</option>
                  <option value="M">Средний (M - 15%)</option>
                  <option value="Q">Высокий (Q - 25%)</option>
                  <option value="H">Крепкий (H - 30%)</option>
                </select>
                <p className={`text-[10px] mt-1 opacity-60 ${themeClasses.label}`}>Выбирайте H для крупных логотипов</p>
              </div>
            </div>

            {/* Size Slider */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${themeClasses.label}`}>
                Разрешение: <span className="font-semibold">{size}x{size} px</span>
              </label>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-500/30 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

          </div>
        </div>

        {/* Right Bento: Preview & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className={`p-8 rounded-3xl ${themeClasses.cardBd} flex flex-col items-center justify-center min-h-[400px] lg:min-h-0 flex-grow relative overflow-hidden group`}>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 transition-transform duration-300 hover:scale-105">
              <div ref={qrRef} className="rounded-2xl overflow-hidden shadow-2xl bg-white p-4"></div>
            </div>

            {error && (
              <div className="absolute bottom-6 left-6 right-6 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-center backdrop-blur-md">
                {error}
              </div>
            )}
          </div>

          {/* Actions Row */}
          <div className={`p-4 rounded-3xl ${themeClasses.cardBd} flex flex-wrap sm:flex-nowrap gap-4 justify-between items-center`}>
            <button
              onClick={saveToHistory}
              disabled={isLoading}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${isLoading
                ? 'bg-gray-500/50 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]'
                }`}
            >
              {isLoading ? 'Сохранение...' : '💾 Сохранить в историю'}
            </button>

            <div className="flex gap-2 flex-1">
              <button
                onClick={() => downloadQr('png')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors border ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-black/5 hover:bg-black/10 border-black/10'}`}
              >
                PNG
              </button>
              <button
                onClick={() => downloadQr('svg')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors border ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-black/5 hover:bg-black/10 border-black/10'}`}
              >
                SVG
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* History Ribbon (Bottom) */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${themeClasses.label}`}>Недавние коды</h3>
          {history.length > 0 && (
            <button onClick={handleClearHistory} className="text-xs text-red-500 hover:text-red-400 px-3 py-1 rounded bg-red-500/10 transition-colors">
              Очистить историю
            </button>
          )}
        </div>
        <div className="flex overflow-x-auto pb-6 gap-4 snap-x hide-scrollbar">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                className={`flex-none w-48 p-3 rounded-2xl transition-all cursor-pointer snap-start hover:-translate-y-2 relative group overflow-hidden ${themeClasses.historyCard}`}
                onClick={() => {
                  setContent(item.content);
                  setActiveTab('url'); // fallback to url tab when loading history
                  if (item.colorDark) setColorDark(item.colorDark);
                  if (item.colorLight) setColorLight(item.colorLight);
                  if (item.dotsType) setDotsType(item.dotsType);
                  if (item.cornersSquareType) setCornersSquareType(item.cornersSquareType);
                  if (item.cornersDotType) setCornersDotType(item.cornersDotType);
                  if (item.logoBase64) setLogoBase64(item.logoBase64);
                }}
              >
                {/* Delete Button top right */}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="absolute top-2 right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                >
                  ✕
                </button>
                <div className="w-full aspect-square bg-white rounded-xl mb-3 overflow-hidden p-1 flex items-center justify-center shadow-inner">
                  <img src={item.qrCode} alt="History QR" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs font-medium truncate w-full mb-1 opacity-90">{item.content}</p>
                <p className="text-[10px] opacity-50 font-mono">{new Date(item.createdAt).toLocaleDateString()}</p>

                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="bg-indigo-600 text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold shadow-lg">Загрузить</span>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-8 text-center opacity-50 text-sm">
              История пуста. Создайте первый QR-код!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
