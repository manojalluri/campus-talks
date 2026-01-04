import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X, Image as ImageIcon, ExternalLink, Eye, MousePointerClick } from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const AdManager = () => {
    const [ads, setAds] = useState([]);
    const [isEditingAd, setIsEditingAd] = useState(false);
    const [editingAd, setEditingAd] = useState({
        type: 'banner',
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        buttonText: 'Learn More',
        isActive: true,
        position: 'feed',
        displayFrequency: 'session'
    });
    const adminToken = localStorage.getItem('campus_talks_admin_token');

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await axios.get('/api/admin/ads', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            setAds(res.data || []);
        } catch (_err) {
            toast.error('Failed to load ads');
        }
    };

    const handleSaveAd = async (e) => {
        e.preventDefault();
        try {
            if (editingAd._id) {
                await axios.patch(`/api/admin/ads/${editingAd._id}`, editingAd, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                toast.success('Ad updated');
            } else {
                await axios.post('/api/admin/ads', editingAd, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                toast.success('Ad created');
            }
            setIsEditingAd(false);
            fetchAds();
            resetForm();
        } catch (_err) {
            toast.error('Error saving ad');
        }
    };

    const handleDeleteAd = async (id) => {
        if (!window.confirm('Delete this advertisement?')) return;
        try {
            await axios.delete(`/api/admin/ads/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            toast.success('Ad deleted');
            fetchAds();
        } catch (_err) {
            toast.error('Failed to delete ad');
        }
    };

    const resetForm = () => {
        setEditingAd({
            type: 'banner',
            title: '',
            description: '',
            imageUrl: '',
            linkUrl: '',
            buttonText: 'Learn More',
            isActive: true,
            position: 'feed',
            displayFrequency: 'session'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl sm:text-2xl font-display font-black text-white">Ad Control Center</h3>
                    <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-black">Popups, Banners, & Analytics</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsEditingAd(true); }}
                    className="w-full sm:w-auto px-6 py-3 bg-primary-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow"
                >
                    <Plus size={16} /> Create Campaign
                </button>
            </div>

            {/* Ad List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                    <div
                        key={ad._id}
                        className={clsx(
                            "bg-slate-900/50 border rounded-2xl p-6 space-y-4",
                            ad.isActive ? "border-white/10" : "border-white/5 opacity-50"
                        )}
                    >
                        {/* Ad Preview */}
                        {ad.imageUrl && (
                            <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-800">
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Ad Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={clsx(
                                    "px-2 py-1 text-[9px] font-black uppercase rounded-full",
                                    ad.type === 'popup' && "bg-primary-purple/20 text-primary-purple",
                                    ad.type === 'banner' && "bg-primary-blue/20 text-primary-blue",
                                    ad.type === 'sponsor' && "bg-accent-green/20 text-accent-green"
                                )}>
                                    {ad.type}
                                </span>
                                <span className={clsx(
                                    "px-2 py-1 text-[9px] font-black uppercase rounded-full",
                                    ad.isActive ? "bg-accent-green/20 text-accent-green" : "bg-white/5 text-text-muted"
                                )}>
                                    {ad.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-white line-clamp-1">{ad.title}</h4>
                            {ad.description && (
                                <p className="text-xs text-text-muted line-clamp-2 mt-1">{ad.description}</p>
                            )}
                        </div>

                        {/* Analytics */}
                        <div className="flex items-center gap-4 text-xs text-text-muted pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1">
                                <Eye size={12} />
                                <span>{ad.impressions || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MousePointerClick size={12} />
                                <span>{ad.clicks || 0}</span>
                            </div>
                            {ad.clicks > 0 && ad.impressions > 0 && (
                                <span className="ml-auto text-primary-blue">
                                    {((ad.clicks / ad.impressions) * 100).toFixed(1)}% CTR
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                onClick={() => { setEditingAd(ad); setIsEditingAd(true); }}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Edit3 size={14} /> Edit
                            </button>
                            <button
                                onClick={() => handleDeleteAd(ad._id)}
                                className="p-2 bg-accent-red/10 hover:bg-accent-red hover:text-white text-accent-red rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {ads.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                        <ImageIcon size={60} className="text-text-muted mb-4" />
                        <p className="text-lg font-bold text-text-muted">No advertisements yet</p>
                    </div>
                )}
            </div>

            {/* Ad Edit/Create Modal */}
            <AnimatePresence>
                {isEditingAd && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsEditingAd(false); resetForm(); }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-2xl bg-slate-900 rounded-[2rem] sm:rounded-3xl border border-white/10 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/5 p-5 sm:p-6 flex items-center justify-between z-10">
                                <h3 className="text-xl sm:text-2xl font-display font-black text-white">
                                    {editingAd._id ? 'Edit Campaign' : 'New Campaign'}
                                </h3>
                                <button
                                    onClick={() => { setIsEditingAd(false); resetForm(); }}
                                    className="p-2.5 bg-white/5 text-text-muted hover:text-white rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveAd} className="p-5 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
                                {/* Ad Type */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        Advertisement Type
                                    </label>
                                    <select
                                        value={editingAd.type}
                                        onChange={(e) => setEditingAd({ ...editingAd, type: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 sm:p-4 text-sm text-white focus:outline-none focus:border-primary-purple transition-all"
                                    >
                                        <option value="popup">Popup Ad</option>
                                        <option value="banner">Banner Ad</option>
                                        <option value="sponsor">Sponsor</option>
                                    </select>
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        Title *
                                    </label>
                                    <input
                                        required
                                        value={editingAd.title}
                                        onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 sm:p-4 text-sm text-white focus:outline-none focus:border-primary-purple transition-all"
                                        placeholder="e.g. Get 50% Off Premium"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={editingAd.description}
                                        onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 sm:p-4 text-sm text-white focus:outline-none focus:border-primary-purple resize-none h-20 sm:h-24 transition-all"
                                        placeholder="Brief description..."
                                    />
                                </div>

                                {/* Image URL */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        Image URL
                                    </label>
                                    <input
                                        value={editingAd.imageUrl}
                                        onChange={(e) => setEditingAd({ ...editingAd, imageUrl: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 sm:p-4 text-sm text-white focus:outline-none focus:border-primary-purple transition-all"
                                        placeholder="https://..."
                                    />
                                </div>

                                {/* Link URL */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        Link URL
                                    </label>
                                    <input
                                        value={editingAd.linkUrl}
                                        onChange={(e) => setEditingAd({ ...editingAd, linkUrl: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 sm:p-4 text-sm text-white focus:outline-none focus:border-primary-purple transition-all"
                                        placeholder="https://..."
                                    />
                                </div>

                                {/* Button Text */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                        Button Text
                                    </label>
                                    <input
                                        value={editingAd.buttonText}
                                        onChange={(e) => setEditingAd({ ...editingAd, buttonText: e.target.value })}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary-purple"
                                        placeholder="Learn More"
                                    />
                                </div>

                                {/* Position (for banners) */}
                                {editingAd.type === 'banner' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            Position
                                        </label>
                                        <select
                                            value={editingAd.position}
                                            onChange={(e) => setEditingAd({ ...editingAd, position: e.target.value })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary-purple"
                                        >
                                            <option value="top">Top</option>
                                            <option value="middle">Middle</option>
                                            <option value="bottom">Bottom</option>
                                            <option value="feed">In Feed</option>
                                        </select>
                                    </div>
                                )}

                                {/* Display Frequency (for popups) */}
                                {editingAd.type === 'popup' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            Display Frequency
                                        </label>
                                        <select
                                            value={editingAd.displayFrequency}
                                            onChange={(e) => setEditingAd({ ...editingAd, displayFrequency: e.target.value })}
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary-purple"
                                        >
                                            <option value="once">Once per user (permanent)</option>
                                            <option value="session">Once per session</option>
                                            <option value="always">Every page load</option>
                                        </select>
                                    </div>
                                )}

                                {/* Active Toggle */}
                                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        checked={editingAd.isActive}
                                        onChange={(e) => setEditingAd({ ...editingAd, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded accent-primary-purple"
                                    />
                                    <label className="text-sm font-bold text-white">
                                        Advertisement is Active
                                    </label>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-primary-gradient text-white font-black uppercase tracking-widest rounded-2xl shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    <Save size={18} />
                                    {editingAd._id ? 'Update Ad' : 'Create Ad'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdManager;
