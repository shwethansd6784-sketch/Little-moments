import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Check,
  Search,
  Image as ImageIcon,
  Music,
  Heart,
  Lock,
  Upload,
  Trash2,
  MoveUp,
  MoveDown,
  Wand2,
  Copy,
  Gift as GiftIcon,
  HelpCircle,
} from 'lucide-react';
import { OCCASIONS, FONT_OPTIONS, PASSWORD_TYPES } from '../../lib/types';
import { THEMES_BY_OCCASION, getTheme, getThemesForOccasion } from '../../data/themes';
import { getInspirationsForOccasion } from '../../data/writingSuggestions';
import { PRESET_TRACKS, audioPlayer } from '../../lib/audioPresets';
import { generateSlug } from '../../lib/cryptoUtils';
import { RecipientExperience } from '../recipient/RecipientExperience';

// Helper to downscale and compress heavy camera images to fast, crisp WebP/JPEG
function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result || '');
      img.src = e.target?.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export const GiftWizard = ({ initialGift = null, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [occasionSearch, setOccasionSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showInspirations, setShowInspirations] = useState(false);
  const fileInputId = useId();

  // Gift Form State
  const [giftData, setGiftData] = useState(() => {
    if (initialGift) return { ...initialGift };
    return {
      id: `draft-${Date.now()}`,
      slug: generateSlug('gift'),
      occasion: 'birthday',
      recipient_name: '',
      theme_id: 'bday_pastel',
      letter_content: {
        greeting: 'Dearest,',
        body: 'Some moments are too special to let pass without saying how much you mean to me...',
        closing: 'With all my warmest love,',
        sender_name: '',
      },
      letter_font: 'cursive',
      letter_settings: {
        fontSize: 22,
        textColor: '#374151',
        textAlign: 'center',
        lineHeight: 1.8,
      },
      photos: [],
      settings: {
        music_enabled: true,
        music_track: 'sweet_music_box',
        music_title: 'Sweet Music Box Lullaby',
        animation_type: 'birthday_confetti',
      },
      special_message: {
        quote: 'You make every ordinary moment feel extraordinary.',
        note: 'Always remember how loved, treasured, and celebrated you are.',
      },
      final_message: {
        headline: 'Make a Wish, Beautiful Soul! 🌟',
        body: 'Here is to a lifetime of happiness, health, and dreams coming true.',
        surprise_box_label: 'Tap to Unwrap Your Special Surprise! 🎁',
      },
      password_type: PASSWORD_TYPES.PIN,
      rawPassword: '1234', // default PIN for easy start
      published: false,
    };
  });

  // Filtered occasions list
  const filteredOccasions = OCCASIONS.filter((occ) =>
    occ.name.toLowerCase().includes(occasionSearch.toLowerCase()) ||
    occ.id.toLowerCase().includes(occasionSearch.toLowerCase())
  );

  // Selected occasion themes (always at least 3!)
  const availableThemes = getThemesForOccasion(giftData.occasion);

  // AI-Writing suggestions for current occasion
  const inspirations = getInspirationsForOccasion(giftData.occasion);

  // Handle Photo Uploads with automatic responsive optimization
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || e.dataTransfer?.files || []);
    if (!files.length) return;

    setUploadingPhotos(true);
    try {
      const newItems = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const compressedUrl = await compressImage(file);
        if (compressedUrl) {
          newItems.push({
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: compressedUrl,
            caption: '',
            display_order: giftData.photos.length + newItems.length + 1,
          });
        }
      }
      if (newItems.length > 0) {
        setGiftData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...newItems],
        }));
      }
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleReplacePhoto = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressedUrl = await compressImage(file);
    if (compressedUrl) {
      setGiftData((prev) => ({
        ...prev,
        photos: prev.photos.map((p) => (p.id === id ? { ...p, url: compressedUrl } : p)),
      }));
    }
  };

  const handleUpdateCaption = (id, caption) => {
    setGiftData((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, caption } : p)),
    }));
  };

  const handleDeletePhoto = (id) => {
    setGiftData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  };

  const handleMovePhoto = (index, direction) => {
    const newPhotos = [...giftData.photos];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return;
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    setGiftData((prev) => ({ ...prev, photos: newPhotos }));
  };

  const handleSave = async (shouldPublish = false) => {
    setSaving(true);
    try {
      const payload = {
        ...giftData,
        published: shouldPublish ? true : giftData.published,
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-800 font-serif-classic">
              {initialGift ? 'Edit Digital Surprise' : 'Craft a New Little Moment'}
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              Follow the steps to personalize your digital gift.
            </p>
          </div>
        </div>

        {/* Global Save / Preview Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Eye className="w-4 h-4" />
            <span>Full Preview</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Gift</span>
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between overflow-x-auto pb-4 mb-8 border-b border-stone-100 gap-2">
        {[
          { step: 1, label: '1. Occasion & Theme' },
          { step: 2, label: '2. Recipient & Letter' },
          { step: 3, label: '3. Memory Photos' },
          { step: 4, label: '4. Music & Audio' },
          { step: 5, label: '5. Special Message' },
          { step: 6, label: '6. Password & Publish' },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => setStep(item.step)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              step === item.step
                ? 'bg-rose-500 text-white shadow-sm'
                : step > item.step
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {step > item.step && <Check className="w-3 h-3" />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: OCCASION & THEMES */}
      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-stone-800 font-serif-classic mb-1">
              Select an Occasion
            </h2>
            <p className="text-xs text-stone-600 mb-4">
              Choose from holidays, festivals, milestones or custom occasions.
            </p>

            {/* Occasion Search */}
            <div className="relative max-w-md mb-6">
              <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search occasion (e.g. Birthday, Diwali, Wedding, Pet...)"
                value={occasionSearch}
                onChange={(e) => setOccasionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* Occasions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {filteredOccasions.map((occ) => {
                const isSelected = giftData.occasion === occ.id;
                return (
                  <button
                    key={occ.id}
                    onClick={() => {
                      const newThemes = getThemesForOccasion(occ.id);
                      setGiftData((prev) => ({
                        ...prev,
                        occasion: occ.id,
                        theme_id: newThemes[0]?.id || prev.theme_id,
                      }));
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm ring-2 ring-rose-200'
                        : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-2xl">{occ.icon}</span>
                    <span className="text-xs font-bold line-clamp-1">{occ.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distinct Themes Selection (3+ per occasion) */}
          <div className="pt-6 border-t border-stone-200">
            <h2 className="text-xl font-bold text-stone-800 font-serif-classic mb-1">
              Choose a Theme (At least 3 Unique Designs Available)
            </h2>
            <p className="text-xs text-stone-600 mb-4">
              Each theme has its own palette, custom paper texture, typography, and decorative elements.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableThemes.map((th) => {
                const isSelected = giftData.theme_id === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setGiftData((prev) => ({ ...prev, theme_id: th.id }))}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 shadow-lg ring-2 ring-rose-200'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    {/* Theme Miniature Preview */}
                    <div className={`h-28 rounded-xl bg-gradient-to-br ${th.bgGradient} p-3 flex flex-col justify-between border border-white/40 mb-3 shadow-inner`}>
                      <div className="flex justify-between items-center text-sm">
                        <span>{th.waxSeal}</span>
                        <div className="flex gap-1">{th.decorations?.map((d, i) => <span key={i}>{d}</span>)}</div>
                      </div>
                      <div className="bg-white/80 backdrop-blur-xs p-2 rounded-lg text-center shadow-xs">
                        <span className={`text-xs font-bold text-stone-800 ${th.fontClass}`}>
                          Sample Heading
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm text-stone-800">{th.name}</h3>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed mb-3">
                        {th.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isSelected ? 'Theme Selected' : 'Select Theme'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: RECIPIENT & PERSONAL LETTER */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Recipient Name Field */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Who is this surprise for? (Recipient's Name)
            </label>
            <input
              type="text"
              placeholder="e.g. Aria, My Love, Ethan, Dearest Mom..."
              value={giftData.recipient_name}
              onChange={(e) => setGiftData((prev) => ({ ...prev, recipient_name: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Letter Formatting Bar */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800 font-serif-classic">
                Personal Letter Editor
              </h2>
              {/* AI Writing Assistant Toggle */}
              <button
                type="button"
                onClick={() => setShowInspirations(!showInspirations)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Writing Inspirations & Assistant</span>
              </button>
            </div>

            {/* AI Writing Suggestions Drawer */}
            <AnimatePresence>
              {showInspirations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 overflow-hidden text-xs"
                >
                  <p className="font-bold text-purple-900">
                    Need inspiration? Click any phrase below to insert it into your letter:
                  </p>
                  <div>
                    <span className="font-semibold text-purple-800 block mb-1">Greetings:</span>
                    <div className="flex flex-wrap gap-2">
                      {inspirations.greetings.map((g, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setGiftData((prev) => ({
                              ...prev,
                              letter_content: { ...prev.letter_content, greeting: g },
                            }))
                          }
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-purple-800 transition-colors"
                        >
                          + {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-purple-800 block mb-1">Heartfelt Paragraphs:</span>
                    <div className="flex flex-col gap-1.5">
                      {inspirations.paragraphs.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setGiftData((prev) => ({
                              ...prev,
                              letter_content: {
                                ...prev.letter_content,
                                body: prev.letter_content.body + '\n\n' + p,
                              },
                            }))
                          }
                          className="text-left p-2 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-purple-800 transition-colors"
                        >
                          + {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Font Style Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Font Typography
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setGiftData((prev) => ({ ...prev, letter_font: f.id }))}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      giftData.letter_font === f.id
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <span className="text-xs block font-medium">{f.name}</span>
                    <span className={`text-sm ${f.className}`}>{f.preview}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Fields */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Greeting / Opening Line
                </label>
                <input
                  type="text"
                  value={giftData.letter_content.greeting}
                  onChange={(e) =>
                    setGiftData((prev) => ({
                      ...prev,
                      letter_content: { ...prev.letter_content, greeting: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Main Letter Body
                </label>
                <textarea
                  rows={8}
                  value={giftData.letter_content.body}
                  onChange={(e) =>
                    setGiftData((prev) => ({
                      ...prev,
                      letter_content: { ...prev.letter_content, body: e.target.value },
                    }))
                  }
                  placeholder="Write your heartfelt letter here..."
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:ring-2 focus:ring-rose-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Closing Warmth
                  </label>
                  <input
                    type="text"
                    value={giftData.letter_content.closing}
                    onChange={(e) =>
                      setGiftData((prev) => ({
                        ...prev,
                        letter_content: { ...prev.letter_content, closing: e.target.value },
                      }))
                    }
                    placeholder="e.g. Forever yours,"
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Sender Signature / Name
                  </label>
                  <input
                    type="text"
                    value={giftData.letter_content.sender_name}
                    onChange={(e) =>
                      setGiftData((prev) => ({
                        ...prev,
                        letter_content: { ...prev.letter_content, sender_name: e.target.value },
                      }))
                    }
                    placeholder="e.g. Leo ♡"
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PHOTO GALLERY */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-800 font-serif-classic">
                  Photo Gallery & Scrapbook Memories
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                  {giftData.photos.length} {giftData.photos.length === 1 ? 'Photo' : 'Photos'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Upload your friend's personal photographs (JPG, PNG, WEBP). They will be framed in cute Polaroid cards.
              </p>
            </div>

            <label
              htmlFor={fileInputId}
              className={`px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-rose-200 ${
                uploadingPhotos ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              {uploadingPhotos ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{uploadingPhotos ? 'Optimizing Photos...' : 'Upload Photos'}</span>
              <input
                id={fileInputId}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePhotoUpload(e);
            }}
            className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50/70 p-6 rounded-2xl text-center transition-all cursor-pointer select-none"
            onClick={() => document.getElementById(fileInputId)?.click()}
          >
            <ImageIcon className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-stone-700">
              Drag and drop photographs here, or <span className="text-rose-600 underline">browse files</span>
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              Supports JPG, PNG, and WEBP. Photos are automatically optimized for instant loading.
            </p>
          </div>

          {/* Photos List / Grid */}
          {giftData.photos.length === 0 ? (
            <div className="py-8 text-center text-stone-500">
              <p className="text-xs font-medium">
                No personal photographs uploaded yet. Add photos above to complete the memory gallery!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {giftData.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col justify-between group/card shadow-xs"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-200 mb-2">
                    <img
                      src={photo.url}
                      alt="Uploaded memory"
                      className="w-full h-full object-cover"
                    />

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Replace Photo Button */}
                    <label
                      htmlFor={`replace-${photo.id}`}
                      className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold cursor-pointer transition-colors"
                      title="Change this photo"
                    >
                      Replace
                      <input
                        id={`replace-${photo.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleReplacePhoto(photo.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder="Add photo caption..."
                    value={photo.caption}
                    onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-rose-400 bg-white"
                  />

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200 text-xs text-stone-600">
                    <span className="font-semibold text-stone-700">Photo #{index + 1}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMovePhoto(index, -1)}
                        className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
                        title="Move Left/Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === giftData.photos.length - 1}
                        onClick={() => handleMovePhoto(index, 1)}
                        className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
                        title="Move Right/Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: MUSIC & AUDIO */}
      {step === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-bold text-stone-800 font-serif-classic">
                Background Music & Audio
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Set a gentle instrumental melody that plays when the recipient explores the surprise.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-stone-700">Enable Music</span>
              <input
                type="checkbox"
                checked={giftData.settings.music_enabled}
                onChange={(e) =>
                  setGiftData((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, music_enabled: e.target.checked },
                  }))
                }
                className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESET_TRACKS.map((track) => {
              const isSelected = giftData.settings.music_track === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() =>
                    setGiftData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        music_track: track.id,
                        music_title: track.title,
                      },
                    }))
                  }
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-sm ring-2 ring-rose-200'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-800">{track.title}</h4>
                      <p className="text-xs text-stone-600">{track.mood}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioPlayer.startTrack(track.id);
                    }}
                    className="px-3 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs"
                  >
                    Preview
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: SPECIAL MESSAGE & FINAL SURPRISE */}
      {step === 5 && (
        <div className="space-y-6">
          {/* Special Heart Message */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-stone-800 font-serif-classic">
              Heartfelt Special Message
            </h2>
            <p className="text-xs text-stone-600">
              Accessed through the heart-holding teddy bear in the recipient interface.
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Featured Meaningful Quote
              </label>
              <input
                type="text"
                value={giftData.special_message.quote}
                onChange={(e) =>
                  setGiftData((prev) => ({
                    ...prev,
                    special_message: { ...prev.special_message, quote: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Personal Note / Hint
              </label>
              <textarea
                rows={3}
                value={giftData.special_message.note}
                onChange={(e) =>
                  setGiftData((prev) => ({
                    ...prev,
                    special_message: { ...prev.special_message, note: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
          </div>

          {/* Final Surprise */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-stone-800 font-serif-classic">
              Final Surprise Reveal
            </h2>
            <p className="text-xs text-stone-600">
              The grand finale with celebration fireworks and unboxing animation.
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Headline Celebration Wish
              </label>
              <input
                type="text"
                value={giftData.final_message.headline}
                onChange={(e) =>
                  setGiftData((prev) => ({
                    ...prev,
                    final_message: { ...prev.final_message, headline: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Warm Closing Wishes
              </label>
              <textarea
                rows={3}
                value={giftData.final_message.body}
                onChange={(e) =>
                  setGiftData((prev) => ({
                    ...prev,
                    final_message: { ...prev.final_message, body: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: PASSWORD & PUBLISH */}
      {step === 6 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-stone-800 font-serif-classic">
              Recipient Access Security & Publishing
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Set the password or PIN the recipient must enter to open their surprise.
            </p>
          </div>

          {/* PIN vs Password Type Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() =>
                setGiftData((prev) => ({
                  ...prev,
                  password_type: PASSWORD_TYPES.PIN,
                }))
              }
              className={`p-4 rounded-2xl border cursor-pointer ${
                giftData.password_type === PASSWORD_TYPES.PIN
                  ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <h4 className="font-bold text-sm">Numeric Keypad PIN (Recommended)</h4>
              <p className="text-xs text-stone-600 mt-1">
                Displays the cute on-screen numeric keypad with pointing teddy bear.
              </p>
            </div>

            <div
              onClick={() =>
                setGiftData((prev) => ({
                  ...prev,
                  password_type: PASSWORD_TYPES.ALPHANUMERIC,
                }))
              }
              className={`p-4 rounded-2xl border cursor-pointer ${
                giftData.password_type === PASSWORD_TYPES.ALPHANUMERIC
                  ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <h4 className="font-bold text-sm">Alphanumeric Password</h4>
              <p className="text-xs text-stone-600 mt-1">
                Secret word, date, or personal phrase entered in a secure text field.
              </p>
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {giftData.password_type === PASSWORD_TYPES.PIN
                ? 'Set Recipient Numeric PIN'
                : 'Set Recipient Secret Password'}
            </label>
            <input
              type={giftData.password_type === PASSWORD_TYPES.PIN ? 'text' : 'text'}
              maxLength={giftData.password_type === PASSWORD_TYPES.PIN ? 8 : 32}
              value={giftData.rawPassword}
              onChange={(e) =>
                setGiftData((prev) => ({ ...prev, rawPassword: e.target.value }))
              }
              placeholder={giftData.password_type === PASSWORD_TYPES.PIN ? '1234' : 'secretword'}
              className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-stone-200 text-base font-mono font-bold tracking-widest text-stone-800"
            />
            <p className="text-xs text-stone-600 mt-1">
              Give this code to your recipient along with their unique gift link.
            </p>
          </div>

          {/* Unique Slug Display */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                Unique Gift Link Preview
              </span>
              <span className="text-xs sm:text-sm font-mono font-semibold text-rose-600">
                {window.location.origin}/#/gift/{giftData.slug}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/#/gift/${giftData.slug}`;
                navigator.clipboard.writeText(url);
                alert('Gift link copied to clipboard!');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Step Navigation Bar */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        {step < 6 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => Math.min(6, prev + 1))}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Gift Now</span>
          </button>
        )}
      </div>

      {/* Full Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">
                Live Recipient Experience Preview
              </span>
            </div>
            <button
              onClick={() => setPreviewOpen(false)}
              className="px-3.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold"
            >
              Exit Preview ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RecipientExperience previewGift={{ ...giftData, unlocked: true }} />
          </div>
        </div>
      )}
    </div>
  );
};
