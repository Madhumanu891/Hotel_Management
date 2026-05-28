import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner,     setShowBanner]     = useState(false);
  const [installed,      setInstalled]      = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Check if dismissed
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showBanner || installed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 bg-white rounded-2xl shadow-xl border p-4">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
          <Smartphone className="h-5 w-5 text-primary-700" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm">
            Install NexoraHotels
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Add to home screen for faster access and offline use
          </div>
          <button
            onClick={handleInstall}
            className="mt-3 flex items-center gap-2 bg-primary-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}