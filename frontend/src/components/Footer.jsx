import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-[#1D2926] py-8 bg-white dark:bg-[#070C0B]">
      <div className="max-w-[1080px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo - Explicit colors to prevent inheritance issues */}
        <div className="flex items-center gap-2 font-display font-semibold text-[15px] text-neutral-900 dark:text-white">
          <svg className="w-6 h-6" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="14" fill="#14B8A6"/>
            <path d="M9 20C9 14 12 9 20 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="20" cy="9" r="2.4" fill="white"/>
          </svg>
          Illust Studio
        </div>
        <p className="text-xs font-mono text-neutral-500 dark:text-[#8AA39B]">© 2026 Illust Studio Digital. Built for artists, by artists.</p>
      </div>
    </footer>
  );
}