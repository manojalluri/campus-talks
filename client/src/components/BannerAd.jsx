import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import axios from 'axios';

const BannerAd = ({ ad }) => {
    useEffect(() => {
        if (ad?._id) {
            // Record impression
            axios.post(`/api/ads/${ad._id}/impression`).catch(() => { });
        }
    }, [ad?._id]);

    const handleClick = () => {
        if (ad?.linkUrl) {
            axios.post(`/api/ads/${ad._id}/click`).catch(() => { });
            window.open(ad.linkUrl, '_blank');
        }
    };

    if (!ad || (!ad.title && !ad.imageUrl)) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group cursor-pointer"
            onClick={handleClick}
        >
            <div className="flex flex-col md:flex-row items-center gap-4 p-4">
                {ad.imageUrl && (
                    <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                        <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}

                <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-primary-purple/20 text-primary-purple text-[9px] font-black uppercase tracking-widest rounded-full mb-2">
                        Sponsored
                    </div>
                    <h3 className="text-lg font-display font-bold text-white mb-1">
                        {ad.title}
                    </h3>
                    {ad.description && (
                        <p className="text-sm text-text-muted line-clamp-2">
                            {ad.description}
                        </p>
                    )}
                </div>

                {ad.linkUrl && (
                    <div className="flex-shrink-0">
                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2">
                            <span>{ad.buttonText || 'Learn More'}</span>
                            <ExternalLink size={16} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BannerAd;
