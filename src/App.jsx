import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { CreatorDashboard } from './components/creator/CreatorDashboard';
import { GiftWizard } from './components/creator/GiftWizard';
import { AuthModal } from './components/creator/AuthModal';
import { SupabaseSetupGuide } from './components/creator/SupabaseSetupGuide';
import { RecipientExperience } from './components/recipient/RecipientExperience';
import { GiftService, isSupabaseConfigured } from './lib/supabaseClient';
import { Gift, Heart, Sparkles, Shield, ArrowRight, Lock, Key } from 'lucide-react';
import { SAMPLE_GIFTS } from './data/sampleGifts';

/**
 * Isolated Recipient Route Component
 * GUARANTEE: Never renders creator dashboard, editing tools, or creator navigation.
 */
function RecipientRoute() {
  const { slug } = useParams();
  return <RecipientExperience slug={slug} />;
}

/**
 * Main Application Controller
 */
function MainApp() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [previewGift, setPreviewGift] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Load current authenticated user on boot
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await GiftService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoadingUser(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await GiftService.logout();
    setUser(null);
    setIsWizardOpen(false);
    setEditingGift(null);
  };

  const handleSaveGift = async (giftData) => {
    await GiftService.saveGift(giftData);
    setIsWizardOpen(false);
    setEditingGift(null);
  };

  // If currently on a recipient link (/gift/:slug), do not render Creator Navbar or Dashboard!
  if (location.pathname.startsWith('/gift/')) {
    return (
      <Routes>
        <Route path="/gift/:slug" element={<RecipientRoute />} />
      </Routes>
    );
  }

  // Creator Preview Overlay Modal
  if (previewGift) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 flex flex-col">
        <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">
              Creator Preview Mode – Recipient Experience
            </span>
          </div>
          <button
            onClick={() => setPreviewGift(null)}
            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
          >
            Exit Preview ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <RecipientExperience previewGift={{ ...previewGift, unlocked: false }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/30">
      {/* Creator Interface Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setSettingsOpen(true)}
        onNewGift={() => {
          setEditingGift(null);
          setIsWizardOpen(true);
        }}
      />

      {/* Main Creator Space */}
      <main className="flex-1">
        {isWizardOpen ? (
          <GiftWizard
            initialGift={editingGift}
            onSave={handleSaveGift}
            onCancel={() => {
              setIsWizardOpen(false);
              setEditingGift(null);
            }}
          />
        ) : user ? (
          /* Authenticated Creator Dashboard */
          <CreatorDashboard
            user={user}
            onNewGift={() => {
              setEditingGift(null);
              setIsWizardOpen(true);
            }}
            onEditGift={(gift) => {
              setEditingGift(gift);
              setIsWizardOpen(true);
            }}
            onOpenSettings={() => setSettingsOpen(true)}
            onLogout={handleLogout}
            onPreviewGift={(gift) => setPreviewGift(gift)}
          />
        ) : (
          /* Public Creator Landing & Demo Showcase */
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-4 shadow-2xs">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Little Moments – A Gift Made Just for You</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif-classic tracking-tight leading-tight">
                Create magical personalized digital surprises for someone special.
              </h1>
              <p className="text-base sm:text-lg text-stone-600 mt-4 leading-relaxed font-rounded">
                Write heartfelt letters, curate photo scrapbook memories, set background melodies, and lock your gift with a secret keypad PIN.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-base shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Start Creating a Gift</span>
                </button>

                <button
                  onClick={() => setSettingsOpen(true)}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Supabase & Security Setup</span>
                </button>
              </div>
            </div>

            {/* Ready-to-Experience Sample Gifts */}
            <div className="pt-10 border-t border-stone-200/80">
              <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
                  Try It As a Recipient Right Now
                </span>
                <h2 className="text-2xl font-bold text-stone-800 font-serif-classic mt-1">
                  Experience Finished Demo Gifts
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  (Default demo unlocking PIN for all sample gifts is: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-rose-600 font-mono font-bold">1234</code>)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAMPLE_GIFTS.map((sample) => (
                  <div
                    key={sample.id}
                    className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase font-bold text-rose-600 tracking-wider">
                          {sample.occasion}
                        </span>
                        <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                          PIN: 1234
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-stone-800 font-serif-classic mb-2">
                        For {sample.recipient_name}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                        {sample.letter_content.body}
                      </p>
                    </div>

                    <a
                      href={`/#/gift/${sample.slug}`}
                      className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Unlock Recipient Surprise</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      <SupabaseSetupGuide
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
}
