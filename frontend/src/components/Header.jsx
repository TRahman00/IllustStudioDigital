import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#070C0B] border-b border-neutral-200 dark:border-[#1D2926]">
      <nav className="max-w-[1080px] mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo - Explicit colors to prevent inheritance issues */}
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg text-neutral-900 dark:text-white">
          <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="14" fill="#14B8A6"/>
            <path d="M9 20C9 14 12 9 20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="20" cy="9" r="2.4" fill="white"/>
          </svg>
          Illust Studio
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex gap-8 text-sm text-neutral-500 dark:text-[#8AA39B]">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-black dark:hover:text-white transition">Dashboard</Link>
              <Link to="/studio?tab=draw" className="hover:text-black dark:hover:text-white transition">Studio</Link>
              <Link to="/pricing" className="text-[#14B8A6]">Pricing</Link> {/* <--- Pricing is here! */}
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-black dark:hover:text-white transition">Features</Link>
              <Link to="/pricing" className="text-[#14B8A6]">Pricing</Link>
              <Link to="/" className="hover:text-black dark:hover:text-white transition">Rewards</Link>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggle} 
            className="relative w-14 h-7 rounded-full bg-neutral-100 dark:bg-[#121C1A] border border-neutral-300 dark:border-[#1D2926] transition-all"
            aria-label="Toggle theme"
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#14B8A6] flex items-center justify-center transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : ''}`}>
              {theme === 'dark' ? (
                <svg className="w-3 h-3 text-[#052220]" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
              ) : (
                <svg className="w-3 h-3 text-[#052220]" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.6"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
              )}
            </span>
          </button>

          {/* Conditional Auth Buttons */}
          {user ? (
            <button onClick={handleLogout} className="px-4 py-2 rounded-full border border-neutral-300 dark:border-[#1D2926] text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-[#1D2926]">Sign out</button>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-full border border-neutral-300 dark:border-[#1D2926] text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-[#1D2926]">Sign in</Link>
              <Link to="/register" className="px-4 py-2 rounded-full bg-[#14B8A6] text-black text-sm font-semibold hover:bg-[#2DD4BF]">Get started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}