import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Mail, User, Sparkles, AlertCircle } from 'lucide-react';
import { GiftService, isSupabaseConfigured } from '../../lib/supabaseClient';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        user = await GiftService.signUp(email, password, name);
      } else {
        user = await GiftService.login(email, password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await GiftService.login('creator@littlemoments.love', 'demo1234');
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-800 font-serif-classic">
            {isSignUp ? 'Create Creator Account' : 'Creator Dashboard Sign In'}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {isSupabaseConfigured
              ? 'Secured with Supabase Authentication'
              : 'Local Demo Storage Active'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-600 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-600 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Quick Demo Access */}
        {!isSupabaseConfigured && (
          <div className="mt-4 pt-4 border-t border-stone-100 text-center">
            <button
              onClick={handleDemoSignIn}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant One-Click Demo Login</span>
            </button>
          </div>
        )}

        {/* Toggle sign in / sign up */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-stone-600 hover:text-stone-800 font-medium hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
