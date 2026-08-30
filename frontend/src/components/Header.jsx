import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#070C0B] border-b border-neutral-200 dark:border-[#1D2926]">
      <nav className="max-w-[1080px] mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg text-neutral-900 dark:text-white">
          <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="14" fill="#14B8A6"/>
            <path d="M9 20C9 14 12 9 20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="20" cy="9" r="2.4" fill="white"/>
          </svg>
          Illust Studio
        </Link>

        {/* Nav Links - Dashboard is ALWAYS visible for logged-in users */}
        <div className="hidden md:flex gap-8 text-sm text-neutral-500 dark:text-[#8AA39B]">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-black dark:hover:text-white transition">Dashboard</Link>
              <Link to="/studio?tab=draw" className="hover:text-black dark:hover:text-white transition">Studio</Link>
              <Link to="/pricing" className="text-[#14B8A6]">Pricing</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-[#14B8A6]">Admin</Link>
              )}
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
            type="button"
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

          {/* User Actions - Functional Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-[#121C1A] border border-neutral-300 dark:border-[#1D2926] hover:bg-neutral-200 dark:hover:bg-[#1D2926] transition"
              >
                <span className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white max-w-[100px] truncate">
                  {user?.name || 'User'}
                </span>
                <svg className="w-4 h-4 text-neutral-500 dark:text-[#8AA39B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0D1615] border border-neutral-200 dark:border-[#1D2926] rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-neutral-200 dark:border-[#1D2926]">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-[#8AA39B] truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-neutral-700 dark:text-[#EDF3F0] hover:bg-neutral-100 dark:hover:bg-[#1D2926]">Dashboard</Link>
                    <Link to="/pricing" className="block px-4 py-2 text-sm text-neutral-700 dark:text-[#EDF3F0] hover:bg-neutral-100 dark:hover:bg-[#1D2926]">Pricing</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-teal-600 font-semibold hover:bg-neutral-100 dark:hover:bg-[#1D2926]">Admin Panel</Link>
                    )}
                  </div>
                  <div className="border-t border-neutral-200 dark:border-[#1D2926] py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
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