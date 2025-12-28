import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Gavel, EyeOff, Scale, ShieldCheck, HeartPulse } from 'lucide-react';

const CommunityGuidelinesModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-gradient rounded-2xl flex items-center justify-center text-white shadow-glow">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black font-display text-white tracking-tighter uppercase italic">Campus Safety Charter</h2>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Mandatory Legal Agreement</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 text-text-muted hover:text-white rounded-2xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-accent-red">
                            <ShieldAlert size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">1. ZERO TOLERANCE POLICY</h3>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed font-medium">
                            WhisperCampus maintains a strict zero-tolerance policy towards targeted harassment, cyberbullying, doxxing (releasing private information), or hate speech based on race, gender, religion, or sexual orientation. Users found engaging in systemic bullying will be permanently banned and their device IDs blacklisted.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-primary-purple">
                            <Gavel size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">2. LIABILITY & LEGAL INDEMNITY</h3>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed font-medium">
                            By using this platform, you acknowledge that <span className="text-white">WhisperCampus operates as a neutral service provider</span> under the "Safe Harbor" doctrine. All content is user-generated. You agree to indemnify and hold WhisperCampus and its operators harmless from any legal claims, damages, or liabilities arising from the content you publish.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-accent-green">
                            <HeartPulse size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">3. SELF-HARM & THREATS</h3>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed font-medium">
                            Posts containing specific threats of violence, self-harm, or intentions to harm others are strictly prohibited. In cases of credible threats to life or limb, WhisperCampus reserves the right to cooperate with university security and local law enforcement to ensure campus safety, notwithstanding our anonymity tools.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-primary-blue">
                            <EyeOff size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">4. BOUNDARIES OF ANONYMITY</h3>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed font-medium">
                            While we provide advanced encryption to hide your identity from other users, <span className="text-white italic">Anonymity is a privilege, not a shield for criminal activity.</span> WhisperCampus will respond to valid legal requests, subpoenas, or court orders if required by law to prevent a crime or identify a perpetrator of illegal acts.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-text-muted">
                            <Scale size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">5. MODERATION RIGHTS</h3>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed font-medium">
                            We reserve the absolute right to remove any post, poll, or user account without prior notice if we believe the content violates the "spirit" of the campus community or endangers the brand's reputation for healthy peer connectivity.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-950/80 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-primary-purple hover:text-white transition-all shadow-glow"
                    >
                        I Understand & Accept
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CommunityGuidelinesModal;
