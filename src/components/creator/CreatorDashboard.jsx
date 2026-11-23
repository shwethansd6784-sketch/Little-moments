import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  Sparkles,
  Calendar,
  Lock,
  Globe,
  FileText,
  Clock,
  Layers,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Database,
} from 'lucide-react';
import { GiftService, isSupabaseConfigured } from '../../lib/supabaseClient';
import { OCCASIONS } from '../../lib/types';
import { getTheme } from '../../data/themes';

export const CreatorDashboard = ({
  user,
  onNewGift,
  onEditGift,
  onOpenSettings,
  onLogout,
  onPreviewGift,
}) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'drafts', 'published', 'settings'
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState('');

  // Load creator's gifts
  const loadGifts = async () => {
    setLoading(true);
    try {
      const data = await GiftService.getCreatorGifts(user?.id);
      setGifts(data || []);
    } catch (err) {
      console.error('Error fetching gifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, [user]);

  const handleCopyLink = (slug) => {
    // Generate clean link for recipient
    const recipientUrl = `${window.location.origin}/#/gift/${slug}`;
    navigator.clipboard.writeText(recipientUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(''), 2500);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title || 'this gift'}"?`)) {
      await GiftService.deleteGift(id);
      loadGifts();
    }
  };

  const handleTogglePublish = async (gift) => {
    await GiftService.togglePublish(gift.id, !gift.published);
    loadGifts();
  };

  // Filter gifts by tab
  const displayedGifts = gifts.filter((g) => {
    if (activeTab === 'drafts') return !g.published;
    if (activeTab === 'published') return g.published;
    return true; // 'all'
  });

  const publishedCount = gifts.filter((g) => g.published).length;
  const draftsCount = gifts.filter((g) => !g.published).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Dashboard Top Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-200/50 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background glow discs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name || user?.email?.split('@')[0] || 'Creator'} ♡</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-classic tracking-tight">
            Your Creator Studio
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl mt-1 leading-relaxed">
            Manage your personalized surprises, craft unforgettable memories, and share private recipient links.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onNewGift}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Gift</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Sections 1-6) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Gifts ({gifts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'published'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Published ({publishedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'drafts'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Drafts ({draftsCount})</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-stone-600 hover:bg-stone-100 flex items-center gap-1.5 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 hover:text-rose-600 text-stone-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Gifts Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading your gifts...</p>
        </div>
      ) : displayedGifts.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-stone-200 text-center max-w-lg mx-auto p-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4 text-2xl">
            🎁
          </div>
          <h3 className="text-lg font-bold text-stone-800 font-serif-classic mb-1">
            No gifts in this section
          </h3>
          <p className="text-xs text-stone-600 mb-6">
            Ready to surprise someone? Create a personalized digital moment now!
          </p>
          <button
            onClick={onNewGift}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Gift</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedGifts.map((gift) => {
            const occ = OCCASIONS.find((o) => o.id === gift.occasion) || {
              name: gift.occasion,
              icon: '🎁',
            };
            const theme = getTheme(gift.occasion, gift.theme_id);

            return (
              <div
                key={gift.id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header with Occasion Icon and Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{occ.icon}</span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-600 tracking-wider">
                          {occ.name}
                        </span>
                        <h3 className="font-bold text-base text-stone-800 font-serif-classic line-clamp-1">
                          For {gift.recipient_name || 'Someone Special'}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        gift.published
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {gift.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Theme Preview Strip */}
                  <div
                    className={`h-20 rounded-2xl bg-gradient-to-r ${theme.bgGradient} p-3 flex items-center justify-between border border-white/50 mb-4 shadow-inner`}
                  >
                    <span className="text-xs font-bold text-stone-800 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-xs">
                      {theme.name}
                    </span>
                    <span className="text-xl">{theme.waxSeal || '💌'}</span>
                  </div>

                  {/* Details stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 mb-4">
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-stone-600">Password Type</span>
                      <span className="font-bold text-stone-700 uppercase">
                        {gift.password_type || 'PIN'}
                      </span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-stone-600">Photos Attached</span>
                      <span className="font-bold text-stone-700">
                        {gift.photos?.length || 0} Photos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-1">
                  {/* Copy Link Button */}
                  {gift.published && (
                    <button
                      onClick={() => handleCopyLink(gift.slug)}
                      className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 hover:text-rose-600 text-stone-600 transition-colors"
                      title="Copy Private Recipient Link"
                    >
                      {copiedSlug === gift.slug ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Preview Gift Button */}
                  <button
                    onClick={() => onPreviewGift(gift)}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                    title="Preview Recipient Experience"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Edit Gift Button */}
                  <button
                    onClick={() => onEditGift(gift)}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                    title="Edit Gift"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Publish/Unpublish toggle */}
                  <button
                    onClick={() => handleTogglePublish(gift)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      gift.published
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                  >
                    {gift.published ? 'Unpublish' : 'Publish'}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(gift.id, gift.recipient_name)}
                    className="p-2 rounded-xl text-stone-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Gift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
