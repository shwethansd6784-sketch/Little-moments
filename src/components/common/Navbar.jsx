import React from 'react';
import { Gift, Sparkles, LogIn, LogOut, PlusCircle, Settings, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const Navbar = ({ user, onOpenAuth, onLogout, onOpenSettings, onNewGift }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shadow-md shadow-rose-200">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-stone-800 tracking-tight font-modern">
                Little Moments
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-stone-600 hidden sm:block">
              A Gift Made Just for You
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Status Indicator */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="View Backend & Storage Connection"
          >
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local / Demo Mode'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onNewGift}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-sm shadow-rose-200 flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Gift</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                title="Settings & Supabase Setup"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 hover:text-rose-600 text-stone-600 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold shadow-sm shadow-rose-200 flex items-center gap-1.5 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Creator Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
