"use client";

import { useEffect, useState } from "react";
import { Smartphone, Monitor } from "lucide-react";

export function PWAStatusIndicator() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if running as PWA
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandalone || (isIOS && isIOSStandalone));
    };

    checkInstalled();

    // Listen for app installation
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
    });
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      {isInstalled ? (
        <div className="flex items-center gap-2 bg-lime-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          <Smartphone className="w-4 h-4" />
          <span>Mode App</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          <Monitor className="w-4 h-4" />
          <span>Navigateur</span>
        </div>
      )}
    </div>
  );
}
