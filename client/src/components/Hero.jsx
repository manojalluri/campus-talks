import { PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = ({ onOpenCreate }) => {
    return (
        <div className="bg-primary-gradient py-12 px-4 rounded-2xl mb-8 shadow-xl overflow-hidden relative">
            {/* Decorative patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-900/40 rounded-full -ml-10 -mb-10 blur-2xl opacity-30" />

            <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white drop-shadow-md">
                    What's on your mind today?
                </h1>

                <motion.div
                    onClick={onOpenCreate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 cursor-pointer flex items-center justify-between group"
                >
                    <div className="flex items-center gap-4 text-text-primary/70 group-hover:text-white transition-colors">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <PenTool size={20} />
                        </div>
                        <span className="text-lg font-medium">Share your thoughts anonymously...</span>
                    </div>
                    <div className="hidden sm:flex px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold text-white group-hover:bg-white/30 transition-all">
                        Post Now
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
