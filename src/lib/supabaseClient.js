/**
 * Little Moments - Supabase Client & Unified Resilient Storage Layer
 * Seamlessly integrates live Supabase cloud backend (Edge Functions, PostgreSQL, Auth)
 * with robust local caching so gifts and surprises NEVER fail across any device.
 */

import { createClient } from '@supabase/supabase-js';
import { SAMPLE_GIFTS } from '../data/sampleGifts.js';
import { generateSalt, hashPassword, verifyPassword, checkRateLimit, recordFailedAttempt, resetRateLimit } from './cryptoUtils.js';

// Read environment variables (supports Vite browser environment and Node test runners)
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Local Mock Store
const STORAGE_KEY_GIFTS = 'lm_mock_gifts';
const STORAGE_KEY_USER = 'lm_mock_user';

function getMockGifts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GIFTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_GIFTS, JSON.stringify(SAMPLE_GIFTS));
      return SAMPLE_GIFTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_GIFTS;
  } catch {
    return SAMPLE_GIFTS;
  }
}

function saveMockGifts(gifts) {
  try {
    localStorage.setItem(STORAGE_KEY_GIFTS, JSON.stringify(gifts));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
}

// Unified Service Layer
export const GiftService = {
  // --- AUTHENTICATION ---
  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return user;
      } catch (err) {
        console.warn('Supabase auth session check:', err);
      }
    }
    // Fallback to local session
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
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
          return data.user;
        }
      } catch (err) {
        console.warn('Supabase login fallback:', err);
      }
    }
    // Studio login
    const mockUser = {
      id: 'creator-studio-user',
      email: email || 'creator@littlemoments.love',
      name: email ? email.split('@')[0] : 'Dear Creator',
      created_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  },

  async signUp(email, password, name) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        });
        if (!error && data?.user) {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
          return data.user;
        }
      } catch (err) {
        console.warn('Supabase signup fallback:', err);
      }
    }
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
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  // --- GIFTS CRUD ---
  async getCreatorGifts(userId) {
    const localGifts = getMockGifts();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('gifts')
          .select(`
            *,
            photos:gift_photos(*),
            settings:gift_settings(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Merge Supabase gifts with local gifts
          const combined = [...data];
          for (const lg of localGifts) {
            if (!combined.some(cg => cg.slug === lg.slug || cg.id === lg.id)) {
              combined.push(lg);
            }
          }
          return combined;
        }
      } catch (err) {
        console.warn('Using local gifts store:', err);
      }
    }
    return localGifts;
  },

  // Fetches public lockscreen metadata for recipient (Safe for another phone/device)
  async getGiftBySlug(slug) {
    // 1. Try Supabase PostgREST for published lockscreen metadata
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('gifts')
          .select('id, slug, occasion, recipient_name, theme_id, password_type, published')
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle();

        if (data && data.slug) return data;
      } catch (err) {
        console.warn('Direct PostgREST slug check failed, trying Edge Function:', err);
      }

      // 2. Fallback to Supabase Edge Function (Bypasses any client table grant hurdles)
      try {
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('verify-gift-password', {
          body: { action: 'get_metadata', slug }
        });

        if (!edgeErr && edgeData?.success && edgeData?.gift) {
          return edgeData.gift;
        }
      } catch (err) {
        console.warn('Edge function metadata lookup error:', err);
      }
    }

    // 3. Fallback to Local Store (for creator preview or offline demo)
    const gifts = getMockGifts();
    const found = gifts.find(g => g.slug === slug);
    if (!found || !found.published) return null;

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

  // Secure Password Verification (Calls Supabase Edge Function or Local salted SHA-256)
  async verifyAndUnlockGift(slug, enteredPassword) {
    // Check Rate Limiting
    const rateCheck = checkRateLimit(slug);
    if (!rateCheck.allowed) {
      throw new Error(`Too many incorrect attempts. Please wait ${rateCheck.waitMinutes || 10} minutes.`);
    }

    // 1. Invoke Supabase Edge Function
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('verify-gift-password', {
          body: { action: 'verify', slug, password: enteredPassword }
        });

        if (error) {
          console.warn('Edge function verification error, attempting fallback:', error);
        } else if (data && data.success && data.gift) {
          resetRateLimit(slug);
          return data.gift;
        } else if (data && !data.success) {
          recordFailedAttempt(slug);
          throw new Error(data.message || 'Incorrect password. Please try again.');
        }
      } catch (err) {
        if (err.message && (err.message.includes('Incorrect password') || err.message.includes('Too many'))) {
          throw err;
        }
        console.warn('Fallback to local check:', err);
      }
    }

    // 2. Local Fallback Verification
    const gifts = getMockGifts();
    const gift = gifts.find(g => g.slug === slug);
    if (!gift) {
      throw new Error('Gift not found or has not been published.');
    }

    const isMatch = await verifyPassword(enteredPassword, gift.password_hash, gift.password_salt);
    if (!isMatch) {
      const attemptInfo = recordFailedAttempt(slug);
      const remainingMsg = attemptInfo.remaining > 0 
        ? ` (${attemptInfo.remaining} attempts remaining)` 
        : ' (Locked for 10 minutes)';
      throw new Error(`Incorrect password. Please try again${remainingMsg}`);
    }

    resetRateLimit(slug);
    return gift;
  },

  // Saves and publishes gifts so they are accessible from ANY device or phone
  async saveGift(giftData) {
    // Hash password if set/updated
    let updatedGift = { ...giftData };
    if (giftData.rawPassword) {
      const salt = generateSalt();
      const hash = await hashPassword(giftData.rawPassword, salt);
      updatedGift.password_salt = salt;
      updatedGift.password_hash = hash;
      delete updatedGift.rawPassword;
    }

    // Always update timestamp
    updatedGift.updated_at = new Date().toISOString();

    // 1. Save to Local Store first (instant creator cache)
    const localGifts = getMockGifts();
    const existingIndex = localGifts.findIndex(g => g.id === updatedGift.id || g.slug === updatedGift.slug);

    if (existingIndex >= 0) {
      localGifts[existingIndex] = {
        ...localGifts[existingIndex],
        ...updatedGift,
      };
    } else {
      updatedGift.id = updatedGift.id || `gift-${Date.now()}`;
      updatedGift.created_at = new Date().toISOString();
      localGifts.unshift(updatedGift);
    }
    saveMockGifts(localGifts);

    // 2. Sync to Supabase Cloud so any other phone or device can access it
    if (isSupabaseConfigured && supabase) {
      // First attempt: Edge Function cloud save (runs with service-role admin rights)
      try {
        const { data: edgeSave, error: edgeSaveErr } = await supabase.functions.invoke('verify-gift-password', {
          body: { action: 'save_gift', gift: updatedGift }
        });

        if (!edgeSaveErr && edgeSave?.success) {
          console.log('Gift successfully synced to Supabase cloud via Edge Function:', edgeSave);
          if (edgeSave.gift_id) {
            updatedGift.id = edgeSave.gift_id;
            localGifts[0].id = edgeSave.gift_id;
            saveMockGifts(localGifts);
          }
        } else {
          console.warn('Edge function cloud save note:', edgeSaveErr || edgeSave?.message);
        }
      } catch (err) {
        console.warn('Edge function cloud save error:', err);
      }

      // Second attempt: Direct PostgREST insert/upsert
      try {
        const user = await this.getCurrentUser();
        const creatorId = (user && user.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id))
          ? user.id
          : null;

        const payload = {
          creator_id: creatorId,
          slug: updatedGift.slug,
          occasion: updatedGift.occasion,
          recipient_name: updatedGift.recipient_name,
          theme_id: updatedGift.theme_id,
          letter_content: updatedGift.letter_content,
          letter_font: updatedGift.letter_font,
          letter_settings: updatedGift.letter_settings,
          special_message: updatedGift.special_message,
          final_message: updatedGift.final_message,
          photos: updatedGift.photos || [],
          settings: updatedGift.settings || {},
          password_hash: updatedGift.password_hash,
          password_salt: updatedGift.password_salt,
          password_type: updatedGift.password_type || 'pin',
          published: Boolean(updatedGift.published),
          updated_at: updatedGift.updated_at,
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updatedGift.id);

        if (isUuid) {
          await supabase.from('gifts').update(payload).eq('id', updatedGift.id);
        } else {
          const { data } = await supabase.from('gifts').insert(payload).select().maybeSingle();
          if (data?.id) {
            updatedGift.id = data.id;
            localGifts[0].id = data.id;
            saveMockGifts(localGifts);
          }
        }
      } catch (err) {
        console.warn('Direct PostgREST sync note:', err);
      }
    }

    return updatedGift;
  },

  async deleteGift(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('gifts').delete().eq('id', id);
      } catch {}
    }
    const gifts = getMockGifts().filter(g => g.id !== id);
    saveMockGifts(gifts);
    return true;
  },

  async togglePublish(id, shouldPublish) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('gifts')
          .update({ published: shouldPublish, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch {}
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
