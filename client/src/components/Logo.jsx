import clsx from 'clsx';
import logo from '../assets/logo.png';

const Logo = ({ sm }) => (
    <div className={clsx("flex items-center gap-3 font-display font-black select-none", sm ? "text-xl" : "text-3xl")}>
        <div className={clsx("relative flex items-center justify-center transition-transform hover:scale-110", sm ? "w-12 h-12" : "w-16 h-16")}>
            <img
                src={logo}
                alt="Campus Talks Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            />
        </div>
        <span className="tracking-tighter text-white">Campus<span className="text-primary-purple">Talks</span></span>
    </div>
);

export default Logo;
