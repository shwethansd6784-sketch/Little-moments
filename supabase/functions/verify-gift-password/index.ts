// ==============================================================================
// Supabase Edge Function: verify-gift-password
// Complete Secure Backend API for Little Moments:
// 1. get_metadata: Public lockscreen metadata (zero secrets exposed)
// 2. verify: Secure server-side salted SHA-256 password verification + rate limiting
// 3. save_gift: Cloud persistence for gifts, photos, and settings
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;
const RESET_WINDOW_MINUTES = 10;

async function sha256(message: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ success: false, message: "Server configuration missing." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || (body.password !== undefined ? "verify" : "get_metadata");
    const slug = body.slug || body.gift_id || body.giftId || body.id;

    // --------------------------------------------------------------------------
    // ACTION 1: GET METADATA (Public Lockscreen Data ONLY)
    // --------------------------------------------------------------------------
    if (action === "get_metadata" || action === "get") {
      if (!slug) {
        return new Response(
          JSON.stringify({ success: false, message: "Gift slug or ID is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      let query = supabaseAdmin
        .from("gifts")
        .select("id, slug, occasion, recipient_name, theme_id, password_type, published")
        .eq("published", true);

      if (isUuid) {
        query = query.or(`id.eq.${slug},slug.eq.${slug}`);
      } else {
        query = query.eq("slug", slug);
      }

      const { data: gift, error } = await query.maybeSingle();

      if (error || !gift) {
        return new Response(
          JSON.stringify({ success: false, message: "Gift not found or not published." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return ONLY non-sensitive lockscreen info (Never expose letter, photos, or password hash!)
      return new Response(
        JSON.stringify({
          success: true,
          gift: {
            id: gift.id,
            slug: gift.slug,
            occasion: gift.occasion,
            recipient_name: gift.recipient_name,
            theme_id: gift.theme_id,
            password_type: gift.password_type || "pin",
            published: gift.published,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --------------------------------------------------------------------------
    // ACTION 2: SAVE GIFT (Cloud Persistence for Creator)
    // --------------------------------------------------------------------------
    if (action === "save_gift" || action === "save") {
      const g = body.gift;
      if (!g || !g.slug || !g.recipient_name) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid gift payload." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Resolve a valid creator_id for foreign-key constraint if needed
      let creatorId = g.creator_id;
      const isCreatorUuid = creatorId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creatorId);

      if (!isCreatorUuid) {
        // Fetch or create an auth user so PostgreSQL foreign key constraint is satisfied
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        if (userList && userList.users && userList.users.length > 0) {
          creatorId = userList.users[0].id;
        } else {
          // Create fallback creator account
          const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
            email: "creator.studio@littlemoments.love",
            password: "StudioPassword2026!",
            email_confirm: true,
          });
          creatorId = newUser?.user?.id;
        }
      }

      const payload = {
        creator_id: creatorId,
        slug: g.slug,
        occasion: g.occasion || "birthday",
        recipient_name: g.recipient_name,
        theme_id: g.theme_id || "bday_pastel",
        letter_content: g.letter_content || {},
        letter_font: g.letter_font || "cursive",
        letter_settings: g.letter_settings || {},
        special_message: g.special_message || {},
        final_message: g.final_message || {},
        password_hash: g.password_hash,
        password_salt: g.password_salt,
        password_type: g.password_type || "pin",
        published: g.published !== undefined ? Boolean(g.published) : true,
        updated_at: new Date().toISOString(),
      };

      // Check if gift already exists by slug
      const { data: existingGift } = await supabaseAdmin
        .from("gifts")
        .select("id")
        .eq("slug", g.slug)
        .maybeSingle();

      let giftRecordId = existingGift?.id;

      if (giftRecordId) {
        const updateRes = await supabaseAdmin
          .from("gifts")
          .update({
            ...payload,
            photos: g.photos || [],
            settings: g.settings || {}
          })
          .eq("id", giftRecordId);

        if (updateRes.error) {
          await supabaseAdmin.from("gifts").update(payload).eq("id", giftRecordId);
        }
      } else {
        let inserted: any = null;
        let insertError: any = null;

        const resWithJson = await supabaseAdmin
          .from("gifts")
          .insert({
            ...payload,
            photos: g.photos || [],
            settings: g.settings || {}
          })
          .select("id")
          .single();

        if (resWithJson.error) {
          const resFallback = await supabaseAdmin
            .from("gifts")
            .insert(payload)
            .select("id")
            .single();

          inserted = resFallback.data;
          insertError = resFallback.error;
        } else {
          inserted = resWithJson.data;
        }

        if (insertError) {
          console.error("Insert error:", insertError);
          return new Response(
            JSON.stringify({ success: false, message: insertError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        giftRecordId = inserted.id;
      }

      // Sync photos into gift_photos table
      if (Array.isArray(g.photos) && g.photos.length > 0) {
        // Clear previous photos
        await supabaseAdmin.from("gift_photos").delete().eq("gift_id", giftRecordId);

        const photoRecords = g.photos.map((p: any, idx: number) => ({
          gift_id: giftRecordId,
          storage_path: p.url || p.storage_path || "",
          caption: p.caption || "",
          display_order: p.display_order || idx + 1,
        }));

        await supabaseAdmin.from("gift_photos").insert(photoRecords);
      }

      // Sync settings into gift_settings table
      if (g.settings) {
        await supabaseAdmin.from("gift_settings").delete().eq("gift_id", giftRecordId);
        await supabaseAdmin.from("gift_settings").insert({
          gift_id: giftRecordId,
          music_path: g.settings.music_track || g.settings.music_path || "sweet_music_box",
          music_enabled: g.settings.music_enabled !== false,
          animation_settings: {
            animation_type: g.settings.animation_type || "birthday_confetti",
            music_title: g.settings.music_title || "Sweet Music Box Lullaby",
          },
        });
      }

      return new Response(
        JSON.stringify({ success: true, gift_id: giftRecordId, slug: g.slug }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --------------------------------------------------------------------------
    // ACTION 3: VERIFY PASSWORD (Unlock Surprise Experience)
    // --------------------------------------------------------------------------
    const password = body.password;
    if (!slug || password === undefined || password === null || String(password).trim() === "") {
      return new Response(
        JSON.stringify({ success: false, message: "Gift ID and password are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract & hash client IP for rate limiting
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const ipHash = await sha256(rawIp);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    let query = supabaseAdmin
      .from("gifts")
      .select(`
        *,
        photos:gift_photos(*),
        settings:gift_settings(*)
      `)
      .eq("published", true);

    if (isUuid) {
      query = query.or(`id.eq.${slug},slug.eq.${slug}`);
    } else {
      query = query.eq("slug", slug);
    }

    const { data: gift, error: giftError } = await query.maybeSingle();

    if (giftError || !gift) {
      return new Response(
        JSON.stringify({ success: false, message: "Gift not found or has not been published." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const giftSlug = gift.slug || slug;

    // Rate Limiting Check
    const now = new Date();
    const { data: attemptRecord } = await supabaseAdmin
      .from("password_attempts")
      .select("id, attempt_count, locked_until, last_attempt")
      .eq("gift_slug", giftSlug)
      .eq("ip_hash", ipHash)
      .maybeSingle();

    if (attemptRecord) {
      if (attemptRecord.locked_until && new Date(attemptRecord.locked_until) > now) {
        const remainingSeconds = Math.ceil(
          (new Date(attemptRecord.locked_until).getTime() - now.getTime()) / 1000
        );
        const waitMinutes = Math.ceil(remainingSeconds / 60);

        return new Response(
          JSON.stringify({
            success: false,
            locked: true,
            message: `Too many failed attempts. Please wait ${waitMinutes} minute(s).`,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (attemptRecord.last_attempt) {
        const diff = now.getTime() - new Date(attemptRecord.last_attempt).getTime();
        if (diff > RESET_WINDOW_MINUTES * 60 * 1000) {
          await supabaseAdmin
            .from("password_attempts")
            .update({ attempt_count: 0, locked_until: null, last_attempt: now.toISOString() })
            .eq("id", attemptRecord.id);
          attemptRecord.attempt_count = 0;
        }
      }
    }

    // Verify Password Hash
    const salt = gift.password_salt || "";
    const computedHash = await sha256(`${salt}:${password}`);
    const isMatch = computedHash === gift.password_hash;

    if (!isMatch) {
      const currentAttempts = (attemptRecord?.attempt_count || 0) + 1;
      const isLocked = currentAttempts >= MAX_ATTEMPTS;
      const lockedUntil = isLocked
        ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
        : null;

      if (attemptRecord) {
        await supabaseAdmin
          .from("password_attempts")
          .update({
            attempt_count: currentAttempts,
            locked_until: lockedUntil,
            last_attempt: now.toISOString(),
          })
          .eq("id", attemptRecord.id);
      } else {
        await supabaseAdmin.from("password_attempts").insert({
          gift_slug: giftSlug,
          ip_hash: ipHash,
          attempt_count: 1,
          locked_until: null,
          last_attempt: now.toISOString(),
        });
      }

      const remaining = Math.max(0, MAX_ATTEMPTS - currentAttempts);

      return new Response(
        JSON.stringify({
          success: false,
          remaining_attempts: remaining,
          message: isLocked
            ? `Too many incorrect attempts. Locked for ${LOCKOUT_MINUTES} minutes.`
            : "Incorrect password. Please try again.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // On Success: Clear rate limit & update view count
    if (attemptRecord) {
      await supabaseAdmin.from("password_attempts").delete().eq("id", attemptRecord.id);
    }

    await supabaseAdmin
      .from("gifts")
      .update({
        view_count: (gift.view_count || 0) + 1,
        unlocked_at: now.toISOString(),
      })
      .eq("id", gift.id);

    // Format photos array for recipient (Handles both gift_photos relational join and direct JSONB)
    let formattedPhotos: any[] = [];
    if (Array.isArray(gift.photos) && gift.photos.length > 0) {
      formattedPhotos = gift.photos.map((p: any, idx: number) => ({
        id: p.id || `photo-${idx + 1}`,
        url: p.storage_path || p.url || "",
        caption: p.caption || "",
        display_order: p.display_order || idx + 1,
      }));
    }

    // Format settings
    const rawSettings = Array.isArray(gift.settings) ? gift.settings[0] : (gift.settings || {});
    const formattedSettings = {
      music_enabled: rawSettings?.music_enabled !== false,
      music_track: rawSettings?.music_path || rawSettings?.music_track || "sweet_music_box",
      music_title: rawSettings?.animation_settings?.music_title || rawSettings?.music_title || "Sweet Music Box Lullaby",
      animation_type: rawSettings?.animation_settings?.animation_type || rawSettings?.animation_type || "birthday_confetti",
    };

    // Return full decrypted surprise (Strictly exclude password_hash and password_salt)
    const safeGift = {
      id: gift.id,
      slug: gift.slug,
      occasion: gift.occasion,
      recipient_name: gift.recipient_name,
      theme_id: gift.theme_id,
      letter_content: gift.letter_content,
      letter_font: gift.letter_font,
      letter_settings: gift.letter_settings,
      special_message: gift.special_message,
      final_message: gift.final_message,
      photos: formattedPhotos,
      settings: formattedSettings,
      created_at: gift.created_at,
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification successful.",
        gift: safeGift,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "An error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
