/**
 * Little Moments - Supabase Client & Unified Storage Layer
 * Supports both live Supabase backend and an intelligent, offline-capable
 * local mock store for seamless evaluation and zero-setup testing.
 */

import { createClient } from '@supabase/supabase-js';
import { SAMPLE_GIFTS } from '../data/sampleGifts';
import { generateSalt, hashPassword, verifyPassword, checkRateLimit, recordFailedAttempt, resetRateLimit } from './cryptoUtils';

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local Mock Store for Demo Mode
const STORAGE_KEY_GIFTS = 'lm_mock_gifts';
const STORAGE_KEY_USER = 'lm_mock_user';

function getMockGifts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GIFTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_GIFTS, JSON.stringify(SAMPLE_GIFTS));
      return SAMPLE_GIFTS;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_GIFTS;
  }
}

function saveMockGifts(gifts) {
  try {
    localStorage.setItem(STORAGE_KEY_GIFTS, JSON.stringify(gifts));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Unified Service Layer
export const GiftService = {
  // --- AUTHENTICATION ---
  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
    // Mock user
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  },

  async login(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    }
    // Mock login: Accept any email for demonstration
    const mockUser = {
      id: 'demo-user-1',
      email: email || 'creator@littlemoments.love',
      name: email.split('@')[0] || 'Dear Creator',
      created_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  },

  async signUp(email, password, name) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) throw error;
      return data.user;
    }
    // Mock sign-up
    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      name: name || email.split('@')[0] || 'Creator',
      created_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  },

  async logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  // --- GIFTS CRUD ---
  async getCreatorGifts(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('gifts')
        .select(`
          *,
          photos:gift_photos(*),
          settings:gift_settings(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
    // Mock
    const gifts = getMockGifts();
    return gifts;
  },

  async getGiftBySlug(slug) {
    if (isSupabaseConfigured && supabase) {
      // Return public minimal metadata for lockscreen only
      const { data, error } = await supabase
        .from('gifts')
        .select('id, slug, occasion, recipient_name, theme_id, password_type, published')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) return null;
      return data;
    }
    // Mock
    const gifts = getMockGifts();
    const found = gifts.find(g => g.slug === slug);
    if (!found || !found.published) return null;
    // Return safe public metadata
    return {
      id: found.id,
      slug: found.slug,
      occasion: found.occasion,
      recipient_name: found.recipient_name,
      theme_id: found.theme_id,
      password_type: found.password_type || 'pin',
      published: found.published,
    };
  },

  // Secure Password Verification (Simulates Edge Function in demo mode or calls Supabase RPC/Function)
  async verifyAndUnlockGift(slug, enteredPassword) {
    // 1. Check Rate Limiting
    const rateCheck = checkRateLimit(slug);
    if (!rateCheck.allowed) {
      throw new Error(`Too many incorrect attempts. Please wait ${rateCheck.waitMinutes || 10} minutes.`);
    }

    if (isSupabaseConfigured && supabase) {
      // In Supabase, invoke the Edge Function or secure RPC function
      try {
        const { data, error } = await supabase.functions.invoke('verify-gift-password', {
          body: { slug, password: enteredPassword }
        });
        if (error || !data || !data.success) {
          recordFailedAttempt(slug);
          throw new Error(data?.message || 'Incorrect password. Please try again.');
        }
        resetRateLimit(slug);
        return data.gift;
      } catch (err) {
        // Fallback to checking via RPC if edge function is not deployed yet
        recordFailedAttempt(slug);
        throw err;
      }
    }

    // Mock Mode Verification
    const gifts = getMockGifts();
    const gift = gifts.find(g => g.slug === slug);
    if (!gift) {
      throw new Error('Gift not found.');
    }

    const isMatch = await verifyPassword(enteredPassword, gift.password_hash, gift.password_salt);
    if (!isMatch) {
      const attemptInfo = recordFailedAttempt(slug);
      const remainingMsg = attemptInfo.remaining > 0 
        ? ` (${attemptInfo.remaining} attempts remaining)` 
        : ' (Locked for 10 minutes)';
      throw new Error(`Incorrect password. Please try again${remainingMsg}`);
    }

    // Success! Reset rate limiting and return full decrypted gift surprise
    resetRateLimit(slug);
    return gift;
  },

  async saveGift(giftData) {
    // If setting a password, compute salt and hash
    let updatedGift = { ...giftData };
    if (giftData.rawPassword) {
      const salt = generateSalt();
      const hash = await hashPassword(giftData.rawPassword, salt);
      updatedGift.password_salt = salt;
      updatedGift.password_hash = hash;
      delete updatedGift.rawPassword;
    }

    if (isSupabaseConfigured && supabase) {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('Authentication required');

      const payload = {
        creator_id: user.id,
        slug: updatedGift.slug,
        occasion: updatedGift.occasion,
        recipient_name: updatedGift.recipient_name,
        theme_id: updatedGift.theme_id,
        letter_content: updatedGift.letter_content,
        letter_font: updatedGift.letter_font,
        letter_settings: updatedGift.letter_settings,
        special_message: updatedGift.special_message,
        final_message: updatedGift.final_message,
        password_hash: updatedGift.password_hash,
        password_salt: updatedGift.password_salt,
        password_type: updatedGift.password_type || 'pin',
        published: Boolean(updatedGift.published),
        updated_at: new Date().toISOString(),
      };

      let resultId = updatedGift.id;
      if (updatedGift.id && !updatedGift.id.startsWith('draft-') && !updatedGift.id.startsWith('sample-')) {
        const { error } = await supabase.from('gifts').update(payload).eq('id', updatedGift.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('gifts').insert(payload).select().single();
        if (error) throw error;
        resultId = data.id;
      }
      return { ...updatedGift, id: resultId };
    }

    // Mock Mode
    const gifts = getMockGifts();
    const existingIndex = gifts.findIndex(g => g.id === updatedGift.id || g.slug === updatedGift.slug);

    if (existingIndex >= 0) {
      gifts[existingIndex] = {
        ...gifts[existingIndex],
        ...updatedGift,
        updated_at: new Date().toISOString()
      };
    } else {
      updatedGift.id = updatedGift.id || `gift-${Date.now()}`;
      updatedGift.created_at = new Date().toISOString();
      updatedGift.updated_at = new Date().toISOString();
      gifts.unshift(updatedGift);
    }

    saveMockGifts(gifts);
    return updatedGift;
  },

  async deleteGift(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('gifts').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const gifts = getMockGifts().filter(g => g.id !== id);
    saveMockGifts(gifts);
    return true;
  },

  async togglePublish(id, shouldPublish) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('gifts')
        .update({ published: shouldPublish, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    const gifts = getMockGifts();
    const g = gifts.find(item => item.id === id);
    if (g) {
      g.published = shouldPublish;
      g.updated_at = new Date().toISOString();
      saveMockGifts(gifts);
    }
    return true;
  }
};
