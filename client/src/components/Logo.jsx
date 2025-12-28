import clsx from 'clsx';

const Logo = ({ sm }) => (
    <div className={clsx("flex items-center gap-3 font-display font-black select-none", sm ? "text-lg" : "text-2xl")}>
        <div className={clsx("relative flex items-center justify-center transition-transform hover:scale-110", sm ? "w-8 h-8" : "w-10 h-10")}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                <defs>
                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#0EA5E9" />
                    </linearGradient>
                </defs>
                <path
                    d="M50 10C27.9 10 10 27.9 10 50C10 65.5 18.8 78.9 31.8 85.5C31.2 88.5 29.5 94.5 35 94C45 93 48.5 86.5 50 85C50 85 50.1 85 50.1 85C72.2 85 90.1 67.1 90.1 45C90.1 22.9 72.2 5 50.1 5L50 10Z"
                    stroke="url(#logo-gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="62" cy="45" r="6" fill="url(#logo-gradient)" />
                <circle cx="78" cy="45" r="6" fill="url(#logo-gradient)" />
            </svg>
        </div>
        <span className="tracking-tighter text-white">Campus<span className="text-primary-purple">Talks</span></span>
    </div>
);

export default Logo;
