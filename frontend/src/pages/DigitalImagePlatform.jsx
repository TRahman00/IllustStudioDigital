import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { DrawTabIcon, PhotoTabIcon, AnimateTabIcon, SunIcon, MoonIcon } from '../components/icons/Icons.jsx';
import DrawStudio from './DrawStudio.jsx';
import PhotoStudio from './PhotoStudio.jsx';
import AnimateStudio from './AnimateStudio.jsx';

const TABS = [
  { id: 'draw', label: 'Draw', icon: DrawTabIcon, Component: DrawStudio },
  { id: 'photo', label: 'Photo', icon: PhotoTabIcon, Component: PhotoStudio },
  { id: 'animate', label: 'Animate', icon: AnimateTabIcon, Component: AnimateStudio },
];

export default function DigitalImagePlatform() {
  const [tab, setTab] = useState('draw');
  const { logout } = useAuth();
  const { theme, toggle } = useTheme();
  const Active = TABS.find((t) => t.id === tab).Component;

  return (
    <div className="h-screen flex flex-col bg-[#FBFAF6] dark:bg-[#070C0B]">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-none">
        <nav className="flex items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-2 font-display font-semibold">
            <svg viewBox="0 0 30 30" fill="none" className="w-7 h-7">
              <circle cx="15" cy="15" r="14" fill="#128077" />
              <path d="M9 20C9 14 12 9 20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="20" cy="9" r="2.4" fill="white" />
            </svg>
            Illust Studio
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                  tab === t.id ? 'bg-teal-600 text-white' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-teal-400" aria-label="Toggle theme">
              {theme === 'dark' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
            </button>
            <button onClick={logout} className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">Sign out</button>
          </div>
        </nav>
      </header>

      <div className="flex-1 min-h-0">
        <Active />
      </div>
    </div>
  );
}