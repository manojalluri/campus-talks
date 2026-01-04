import { motion } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';

const LegalModal = ({ onAccept }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-bg-darker/90 backdrop-blur-xl"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-xl bg-bg-card rounded-3xl border border-white/10 p-10 shadow-3xl text-center space-y-8"
            >
                <div className="w-20 h-20 bg-primary-purple/20 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="text-primary-purple" size={40} />
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-display font-bold text-text-primary">Safety First</h2>
                    <p className="text-text-muted leading-relaxed">
                        Welcome to Campus Talks. To keep our community safe and anonymous, you must agree to our guidelines.
                    </p>
                </div>

                <div className="bg-slate-900/50 rounded-2xl p-6 text-left space-y-3 border border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary-purple">Community Rules</h3>
                    <ul className="text-sm text-text-secondary space-y-2 list-disc ml-4">
                        <li>No targeted bullying or harassment.</li>
                        <li>No personal information (names, numbers, etc).</li>
                        <li>You must be 18+ or a verified college student.</li>
                        <li>Content is moderated; inappropriate posts will be deleted.</li>
                    </ul>
                </div>

                <button
                    onClick={onAccept}
                    className="w-full py-4 bg-primary-gradient text-white font-bold rounded-2xl shadow-xl hover:shadow-primary-purple/30 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>I Agree & Enter Campus Talks</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-text-muted">
                    By entering, you confirm you are at least 18 years old and agree to our Terms of Service & Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
};

export default LegalModal;
