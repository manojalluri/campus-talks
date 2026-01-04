import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import axios from 'axios';

const PopupAd = () => {
    const [ad, setAd] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchPopupAd = async () => {
            try {
                const res = await axios.get('/api/ads?type=popup');
                const ads = res.data;

                if (ads.length > 0) {
                    const selectedAd = ads[0]; // Show first active popup ad

                    // Check if already shown based on frequency
                    const lastShown = localStorage.getItem(`popup_ad_${selectedAd._id}`);
                    const now = Date.now();

                    if (selectedAd.displayFrequency === 'once' && lastShown) {
                        return; // Don't show again
                    }

                    if (selectedAd.displayFrequency === 'session') {
                        const sessionShown = sessionStorage.getItem(`popup_ad_${selectedAd._id}`);
                        if (sessionShown) return; // Already shown this session
                    }

                    // Show the ad after a slight delay
                    setTimeout(() => {
                        setAd(selectedAd);
                        setIsVisible(true);

                        // Record impression
                        axios.post(`/api/ads/${selectedAd._id}/impression`).catch(() => { });

                        // Mark as shown
                        if (selectedAd.displayFrequency === 'once') {
                            localStorage.setItem(`popup_ad_${selectedAd._id}`, now);
                        }
                        sessionStorage.setItem(`popup_ad_${selectedAd._id}`, 'true');
                    }, 2000); // Show after 2 seconds
                }
            } catch (err) {
                console.error('Failed to fetch popup ad:', err);
            }
        };

        fetchPopupAd();
    }, []);

    const handleClick = () => {
        if (ad?.linkUrl) {
            axios.post(`/api/ads/${ad._id}/click`).catch(() => { });
            window.open(ad.linkUrl, '_blank');
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!ad || (!ad.title && !ad.imageUrl)) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 shadow-3xl overflow-hidden"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                        >
                            <X size={20} />
                        </button>

                        {ad.imageUrl && (
                            <div className="w-full h-64 overflow-hidden">
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8">
                            <h3 className="text-2xl font-display font-bold text-white mb-3">
                                {ad.title}
                            </h3>
                            {ad.description && (
                                <p className="text-text-muted mb-6 leading-relaxed">
                                    {ad.description}
                                </p>
                            )}

                            {ad.linkUrl && (
                                <button
                                    onClick={handleClick}
                                    className="w-full py-4 bg-primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-primary-purple/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>{ad.buttonText || 'Learn More'}</span>
                                    <ExternalLink size={18} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PopupAd;
