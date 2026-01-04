import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';
import axios from 'axios';

const Sponsors = () => {
    const [sponsors, setSponsors] = useState([]);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const res = await axios.get('/api/ads?type=sponsor');
                setSponsors(res.data);

                // Record impressions for all sponsors
                res.data.forEach(sponsor => {
                    if (sponsor._id) {
                        axios.post(`/api/ads/${sponsor._id}/impression`).catch(() => { });
                    }
                });
            } catch (err) {
                console.error('Failed to fetch sponsors:', err);
            }
        };

        fetchSponsors();
    }, []);

    const handleSponsorClick = (sponsor) => {
        if (sponsor.linkUrl) {
            axios.post(`/api/ads/${sponsor._id}/click`).catch(() => { });
            window.open(sponsor.linkUrl, '_blank');
        }
    };

    if (sponsors.length === 0) return null;

    return (
        <div className="w-full bg-slate-900/30 border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-12 mt-8 sm:mt-16">
            <div className="flex items-center justify-center gap-2 mb-6 sm:mb-10">
                <Heart size={16} className="text-accent-red sm:w-5 sm:h-5" />
                <h3 className="text-lg sm:text-2xl font-display font-black text-white uppercase tracking-widest">
                    Campus Enablers
                </h3>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
                {sponsors.map((sponsor) => (
                    <motion.div
                        key={sponsor._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6 cursor-pointer transition-all group"
                        onClick={() => handleSponsorClick(sponsor)}
                    >
                        {sponsor.imageUrl ? (
                            <div className="w-full aspect-square mb-3 sm:mb-4 rounded-xl overflow-hidden bg-white/5">
                                <img
                                    src={sponsor.imageUrl}
                                    alt={sponsor.title}
                                    className="w-full h-full object-contain p-2 transition-transform group-hover:scale-110"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-square mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-primary-purple/20 to-primary-blue/20 flex items-center justify-center">
                                <span className="text-3xl sm:text-4xl">🎯</span>
                            </div>
                        )}

                        <h4 className="text-xs sm:text-sm font-black text-white text-center mb-1 line-clamp-1 uppercase tracking-wider">
                            {sponsor.title}
                        </h4>

                        {sponsor.description && (
                            <p className="text-[10px] sm:text-xs text-text-muted text-center line-clamp-2 leading-tight">
                                {sponsor.description}
                            </p>
                        )}

                        <div className="mt-3 flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-primary-blue font-bold flex items-center gap-1">
                                Explore <ExternalLink size={10} />
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <p className="text-center text-xs text-text-muted/40 mt-8 font-medium">
                Thank you to our sponsors for supporting Campus Talks
            </p>
        </div>
    );
};

export default Sponsors;
