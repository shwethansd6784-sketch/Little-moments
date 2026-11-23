import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Copy, Database, Shield, Server, HardDrive, Key } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const SupabaseSetupGuide = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('env');
  const [copiedKey, setCopiedKey] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const envSnippet = `# .env file for Little Moments
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
`;

  const schemaSnippet = `-- Quick overview of tables in supabase/schema.sql
-- 1. gifts (stores personalized surprise metadata, letters, messages)
-- 2. gift_photos (private photo uploads with order and captions)
-- 3. gift_settings (music preferences and animation styles)
-- 4. password_attempts (rate limiting protection for gift links)
`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif-classic">
              Supabase Backend & Security Guide
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="text-xs font-semibold text-stone-600">
                Current Status:{' '}
                {isSupabaseConfigured
                  ? 'Connected to Supabase'
                  : 'Running in Local / Demo Mode (Fully Functional)'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 mb-6 gap-2">
          {[
            { id: 'env', label: '1. Environment Variables', icon: Key },
            { id: 'database', label: '2. Database & SQL', icon: Database },
            { id: 'storage', label: '3. Private Storage', icon: HardDrive },
            { id: 'security', label: '4. Security Architecture', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 ${
                  isActive
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-stone-600 hover:text-stone-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Environment Variables */}
        {activeTab === 'env' && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              To connect your own production Supabase instance, create a <code>.env</code> file in the project root:
            </p>

            <div className="relative">
              <pre className="bg-stone-900 text-stone-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto">
                {envSnippet}
              </pre>
              <button
                onClick={() => handleCopy(envSnippet, 'env')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1"
              >
                {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'env' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
              <strong>Notice:</strong> If these variables are not provided, the application runs automatically in safe <strong>Offline Demo Mode</strong> using browser storage and local cryptographic hashing, so you can test all features immediately!
            </div>
          </div>
        )}

        {/* Tab 2: Database Schema */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Open your Supabase project's <strong>SQL Editor</strong> and run the contents of <code>src/supabase/schema.sql</code>. It creates:
            </p>
            <ul className="text-xs sm:text-sm text-stone-700 space-y-2 list-disc pl-5">
              <li><code>gifts</code>: Stores gifts, hashed recipient passwords, personal letters, and surprise messages.</li>
              <li><code>gift_photos</code>: Stores uploaded images and captions linked via foreign keys.</li>
              <li><code>gift_settings</code>: Music selections and celebration styles.</li>
              <li><code>password_attempts</code>: Enforces rate-limiting against brute force attacks.</li>
            </ul>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
              📁 Located at: <code>src/supabase/schema.sql</code>
            </div>
          </div>
        )}

        {/* Tab 3: Storage */}
        {activeTab === 'storage' && (
          <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
            <h4 className="font-bold text-stone-800">Private Bucket Setup</h4>
            <p>
              1. In Supabase Dashboard, navigate to <strong>Storage</strong> → <strong>Create Bucket</strong>.
            </p>
            <p>
              2. Name the bucket: <code>gift-media</code>.
            </p>
            <p>
              3. Keep <strong>Public Bucket</strong> unchecked (Private).
            </p>
            <p>
              4. Media access is protected by Row Level Security and short-lived signed URLs so only authenticated creators and verified recipients can access personal photos.
            </p>
          </div>
        )}

        {/* Tab 4: Security Architecture */}
        {activeTab === 'security' && (
          <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <strong>Zero Plaintext Password Storage:</strong> Passwords and numeric PINs are hashed using client-side and server-side salted SHA-256 algorithms.
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
              <strong>Row Level Security (RLS):</strong> Creators can only access their own gifts (<code>auth.uid() = creator_id</code>). The public endpoint returns only lockscreen metadata.
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800">
              <strong>Rate Limiting:</strong> Enforces maximum 5 attempts with a 10-minute lockout on repeated failures to prevent automated password guessing.
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
