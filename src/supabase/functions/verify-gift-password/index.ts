// ==============================================================================
// Supabase Edge Function: verify-gift-password
// Securely verifies recipient passwords, enforces rate limiting,
// and returns the unlocked surprise payload without exposing password hashes.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Standard CORS headers for client requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limiting parameters
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;
const RESET_WINDOW_MINUTES = 10;

/**
 * Helper to compute SHA-256 hash using the Web Crypto API
 */
async function sha256(message: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Enforce POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 1. Parse request body
    const body = await req.json().catch(() => ({}));
    const giftId = body.gift_id || body.giftId || body.id || body.slug;
    const password = body.password;

    if (!giftId || password === undefined || password === null || String(password).trim() === "") {
      return new Response(
        JSON.stringify({ success: false, message: "Gift ID and password are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Initialize Supabase Admin Client using server-side secrets (never exposed to frontend)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
      return new Response(
        JSON.stringify({ success: false, message: "Internal server configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Extract and hash client IP for privacy & rate limiting
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const ipHash = await sha256(rawIp);

    // 4. Fetch the published gift from database (support lookup by UUID id or text slug)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(giftId);
    
    let query = supabaseAdmin
      .from("gifts")
      .select(`
        *,
        photos:gift_photos(*),
        settings:gift_settings(*)
      `)
      .eq("published", true);

    if (isUuid) {
      query = query.or(`id.eq.${giftId},slug.eq.${giftId}`);
    } else {
      query = query.eq("slug", giftId);
    }

    const { data: gift, error: giftError } = await query.maybeSingle();

    if (giftError || !gift) {
      return new Response(
        JSON.stringify({ success: false, message: "Gift not found or has not been published." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const giftSlug = gift.slug || giftId;

    // 5. Rate Limiting Check using public.password_attempts
    const now = new Date();
    const { data: attemptRecord } = await supabaseAdmin
      .from("password_attempts")
      .select("id, attempt_count, locked_until, last_attempt")
      .eq("gift_slug", giftSlug)
      .eq("ip_hash", ipHash)
      .maybeSingle();

    if (attemptRecord) {
      // Check if client is currently locked out
      if (attemptRecord.locked_until && new Date(attemptRecord.locked_until) > now) {
        const remainingLockSeconds = Math.ceil(
          (new Date(attemptRecord.locked_until).getTime() - now.getTime()) / 1000
        );
        const waitMinutes = Math.ceil(remainingLockSeconds / 60);

        return new Response(
          JSON.stringify({
            success: false,
            locked: true,
            message: `Too many failed attempts. Please wait ${waitMinutes} minute(s) before trying again.`,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Reset attempt count if last attempt was outside the reset window
      if (attemptRecord.last_attempt) {
        const timeSinceLastAttempt = now.getTime() - new Date(attemptRecord.last_attempt).getTime();
        if (timeSinceLastAttempt > RESET_WINDOW_MINUTES * 60 * 1000) {
          await supabaseAdmin
            .from("password_attempts")
            .update({
              attempt_count: 0,
              locked_until: null,
              last_attempt: now.toISOString(),
            })
            .eq("id", attemptRecord.id);
          attemptRecord.attempt_count = 0;
        }
      }
    }

    // 6. Verify password securely using salted SHA-256
    const salt = gift.password_salt || "";
    const computedHash = await sha256(`${salt}:${password}`);
    const isMatch = computedHash === gift.password_hash;

    // 7. Handle Verification Result
    if (!isMatch) {
      // Increment failed attempt count
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

    // 8. On Success: Clear rate limiting record and record unlock event
    if (attemptRecord) {
      await supabaseAdmin
        .from("password_attempts")
        .delete()
        .eq("id", attemptRecord.id);
    }

    // Update unlocked timestamp and view count on the gift
    await supabaseAdmin
      .from("gifts")
      .update({
        view_count: (gift.view_count || 0) + 1,
        unlocked_at: now.toISOString(),
      })
      .eq("id", gift.id);

    // 9. Prepare safe gift payload for recipient (strictly remove password secrets)
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
      photos: gift.photos || [],
      settings: Array.isArray(gift.settings) ? (gift.settings[0] || {}) : (gift.settings || {}),
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
    console.error("Unhandled error in verify-gift-password:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred during password verification.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
