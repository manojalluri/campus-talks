import { PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = ({ onOpenCreate }) => {
    return (
        <div className="bg-primary-gradient py-8 sm:py-12 px-4 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-xl overflow-hidden relative">
            {/* Decorative patterns */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-900/40 rounded-full -ml-8 -mb-8 sm:-ml-10 sm:-mb-10 blur-2xl opacity-30" />

            <div className="max-w-3xl mx-auto text-center relative z-10 space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-white drop-shadow-md leading-tight">
                    What's on your mind today?
                </h1>

                <motion.div
                    onClick={onOpenCreate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 cursor-pointer flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3 sm:gap-4 text-text-primary/70 group-hover:text-white transition-colors">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <PenTool size={16} className="sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-sm sm:text-lg font-medium">Share your thoughts anonymously...</span>
                    </div>
                    <div className="hidden xs:flex px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 rounded-lg text-[10px] sm:text-sm font-black uppercase tracking-widest text-white group-hover:bg-white/30 transition-all">
                        Post Now
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
