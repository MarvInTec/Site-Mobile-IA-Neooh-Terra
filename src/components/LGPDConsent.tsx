import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Cookie, MapPin, X, Settings } from 'lucide-react';

interface ConsentSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  location: boolean;
}

export const LGPDConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ConsentSettings>({
    essential: true, // Sempre verdadeiro
    analytics: false,
    marketing: false,
    location: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('neooh-consent');
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setSettings(parsed);
        if (parsed.location) {
          requestLocation();
        }
      } catch (e) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      location: true,
    };
    saveConsent(allAccepted);
    requestLocation();
  };

  const handleSaveSettings = () => {
    saveConsent(settings);
    if (settings.location) {
      requestLocation();
    }
    setShowSettings(false);
    setShowBanner(false);
  };

  const saveConsent = (newSettings: ConsentSettings) => {
    localStorage.setItem('neooh-consent', JSON.stringify(newSettings));
    setSettings(newSettings);
    setShowBanner(false);
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Localização obtida para conformidade LGPD:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Permissão de localização negada ou erro:", error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 text-left">
              <div className="w-12 h-12 rounded-2xl bg-neo-purple/30 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-neo-lilac" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Privacidade e Cookies (LGPD)</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Utilizamos cookies e sua localização para melhorar sua experiência, personalizar anúncios e analisar nosso tráfego. 
                  Ao clicar em "Aceitar Todos", você concorda com o uso de todas as tecnologias conforme nossa <a href="#" className="text-neo-pink hover:underline">Política de Privacidade</a>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 md:flex-none px-6 py-3 rounded-2xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" /> Preferências
              </button>
              <button
                onClick={() => saveConsent({ ...settings, analytics: false, marketing: false, location: false })}
                className="flex-1 md:flex-none px-6 py-3 rounded-2xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all"
              >
                Recusar
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 md:flex-none px-8 py-3 rounded-2xl neo-gradient text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg"
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-neo-lilac" /> Configurações de Privacidade
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-left">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-neo-lilac" /> Cookies Essenciais
                  </h4>
                  <p className="text-xs text-gray-500">Necessários para o funcionamento do site. Não podem ser desativados.</p>
                </div>
                <div className="w-12 h-6 bg-neo-purple rounded-full relative opacity-50 cursor-not-allowed">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-left">
                  <h4 className="text-white font-bold">Cookies Analíticos</h4>
                  <p className="text-xs text-gray-500">Nos ajudam a entender como os visitantes interagem com o site.</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, analytics: !settings.analytics })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.analytics ? 'bg-neo-pink' : 'bg-zinc-700'}`}
                >
                  <motion.div
                    animate={{ x: settings.analytics ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-left">
                  <h4 className="text-white font-bold">Cookies de Marketing</h4>
                  <p className="text-xs text-gray-500">Usados para exibir anúncios relevantes aos seus interesses.</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, marketing: !settings.marketing })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.marketing ? 'bg-neo-pink' : 'bg-zinc-700'}`}
                >
                  <motion.div
                    animate={{ x: settings.marketing ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-left">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neo-lilac" /> Localização
                  </h4>
                  <p className="text-xs text-gray-500">Permite oferecer conteúdo e anúncios baseados na sua região atual.</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, location: !settings.location })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.location ? 'bg-neo-pink' : 'bg-zinc-700'}`}
                >
                  <motion.div
                    animate={{ x: settings.location ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            </div>

            <div className="p-6 bg-black/20 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 rounded-2xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-6 py-3 rounded-2xl neo-gradient text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg"
              >
                Salvar Preferências
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
