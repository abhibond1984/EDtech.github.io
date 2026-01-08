
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fffaf0]">
      <header className="bg-white/80 backdrop-blur-md border-b-4 border-amber-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-400 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-sky-100">
              <span className="text-white font-bold text-2xl">🧞</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-sky-600 leading-none">
                EduGenie
              </h1>
              <span className="text-amber-500 font-bold text-sm">Adventure!</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button className="bg-emerald-400 text-white px-6 py-2.5 rounded-2xl text-base font-bold bouncy shadow-[0_4px_0_rgb(16,185,129)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(16,185,129)] active:translate-y-[4px] active:shadow-none transition-all">
              My Rewards 🏆
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 font-bold">Made with ❤️ for curious explorers</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
