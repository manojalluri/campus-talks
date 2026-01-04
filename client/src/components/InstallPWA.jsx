import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Download, Share } from 'lucide-react';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Check if iOS
        const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIPhone);

        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Show the prompt if not dismissed in this session
            const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
            if (!isDismissed) {
                setTimeout(() => setIsVisible(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, we can't detect "beforeinstallprompt", so we show a manual hint
        if (isIPhone && !sessionStorage.getItem('pwa_prompt_dismissed')) {
            setTimeout(() => setIsVisible(true), 5000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            // iOS instructions are usually handled by a different UI, but we'll just show guidance
            alert('To install: Tap the "Share" button and then "Add to Home Screen" 📲');
            return;
        }

        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the PWA install');
        } else {
            console.log('User dismissed the PWA install');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md"
                >
                    <div className="bg-slate-900 border-2 border-primary-purple/50 rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(124,58,237,0.25)] backdrop-blur-xl">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary-purple/10 rounded-xl flex items-center justify-center border border-primary-purple/20">
                                <Smartphone className="text-primary-purple" size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-white font-display font-black text-sm sm:text-base flex items-center gap-2">
                                        Campus Talks <span className="text-[10px] bg-primary-purple/20 text-primary-purple px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm">App</span>
                                    </h3>
                                    <button onClick={handleDismiss} className="text-text-muted hover:text-white transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                <p className="text-text-muted text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                                    {isIOS
                                        ? 'Access the anonymous hub faster. Tap Share and "Add to Home Screen" to install.'
                                        : 'Experience Campus Talks faster and offline. Add to your device now.'
                                    }
                                </p>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={handleDismiss}
                                        className="px-5 py-2 text-xs font-bold text-text-muted hover:text-white border border-white/5 rounded-lg transition-all"
                                    >
                                        Later
                                    </button>
                                    <button
                                        onClick={handleInstall}
                                        className="px-6 py-2 bg-primary-gradient text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:scale-105 transition-all shadow-glow-sm flex items-center gap-2"
                                    >
                                        {isIOS ? <Share size={12} /> : <Download size={12} />}
                                        {isIOS ? 'Setup' : 'Install App'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPWA;
