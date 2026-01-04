import { Plus, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Logo from './Logo';
import EditUsernameModal from './EditUsernameModal';

const Navbar = ({ onOpenCreate, user, onLogOut, onOpenAuth }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-6 pointer-events-none">
                <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">

                    {/* Logo Section */}
                    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 sm:gap-4">
                        <Logo sm />
                    </div>

                    {/* Dynamic Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-1.5 sm:p-2 rounded-full shadow-2xl">
                        {user ? (
                            <>
                                <button
                                    onClick={onOpenCreate}
                                    className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-gradient text-white rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-glow-sm"
                                >
                                    <Plus size={14} className="sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Whisper</span>
                                </button>

                                <div className="h-6 sm:h-8 w-px bg-white/10 mx-1 sm:mx-2" />

                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center text-lg sm:text-xl hover:border-primary-purple border border-transparent transition-all overflow-hidden"
                                    >
                                        {user.avatar || '👻'}
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="absolute right-0 mt-4 w-64 bg-[#0f172a] border border-white/10 rounded-3xl shadow-4xl p-2 z-[60] overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-white/5 mb-2 bg-white/5 rounded-t-2xl">
                                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-1">Signed in as</p>
                                                    <p className="text-white font-bold font-display flex items-center gap-2 truncate">
                                                        <span className="text-xl flex-shrink-0">{user.avatar}</span>
                                                        <span className="truncate">{user.username}</span>
                                                    </p>
                                                    <p className="text-[9px] text-text-muted/60 truncate mt-1">{user.email}</p>
                                                </div>

                                                <button
                                                    onClick={() => { setIsEditModalOpen(true); setIsProfileOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-text-secondary hover:bg-white/5 rounded-2xl transition-all"
                                                >
                                                    <UserIcon size={14} /> Edit Persona
                                                </button>

                                                <button
                                                    onClick={() => { onLogOut(); setIsProfileOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-accent-red hover:bg-accent-red/10 rounded-2xl transition-all"
                                                >
                                                    <LogOut size={14} /> Logout Persona
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="px-5 sm:px-8 py-2 sm:py-2.5 bg-white text-black rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95"
                            >
                                Get Access
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {isEditModalOpen && (
                    <EditUsernameModal
                        onClose={() => setIsEditModalOpen(false)}
                        user={user}
                        onUpdate={(updated) => window.location.reload()}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
