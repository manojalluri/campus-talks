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
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-[2rem] shadow-2xl flex items-center gap-4">
                        <Logo sm />
                    </div>

                    {/* Dynamic Actions */}
                    <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-2 rounded-[2rem] shadow-2xl">
                        {user ? (
                            <>
                                <button
                                    onClick={onOpenCreate}
                                    className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary-gradient text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-glow-sm"
                                >
                                    <Plus size={16} /> Whisper
                                </button>

                                <div className="h-8 w-px bg-white/5 mx-2" />

                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xl hover:border-primary-purple border border-transparent transition-all"
                                    >
                                        {user.avatar || '👻'}
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="absolute right-0 mt-4 w-64 bg-[#0f172a] border border-white/10 rounded-3xl shadow-4xl p-2 z-[60]"
                                            >
                                                <div className="p-4 border-b border-white/5 mb-2">
                                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">Signed in as</p>
                                                    <p className="text-white font-bold font-display flex items-center gap-2">
                                                        <span className="text-xl">{user.avatar}</span> {user.username}
                                                    </p>
                                                    <p className="text-[10px] text-text-muted/60 truncate mt-1">{user.email}</p>
                                                </div>

                                                <button
                                                    onClick={() => { setIsEditModalOpen(true); setIsProfileOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-white/5 rounded-2xl transition-all"
                                                >
                                                    <UserIcon size={16} /> Edit Persona
                                                </button>

                                                <button
                                                    onClick={() => { onLogOut(); setIsProfileOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-accent-red hover:bg-accent-red/10 rounded-2xl transition-all"
                                                >
                                                    <LogOut size={16} /> Logout Persona
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="px-6 py-2.5 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
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
