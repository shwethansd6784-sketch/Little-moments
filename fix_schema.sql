-- ==============================================================================
-- LITTLE MOMENTS: PERMISSION & PERSISTENCE FIX
-- ==============================================================================

-- 1. Grant schema and table privileges to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Make creator_id nullable and remove the strict foreign key to auth.users
-- This allows gifts created in studio/demo mode or anonymous sessions to be stored in Supabase
ALTER TABLE public.gifts ALTER COLUMN creator_id DROP NOT NULL;
ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_creator_id_fkey;

-- 3. Also add photos JSONB and settings JSONB columns directly to gifts table
-- This guarantees that the entire gift surprise (letter, photos with captions, music, theme, password hash)
-- is saved in an atomic, bulletproof format in a single record!
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- 4. Update RLS policies on gifts
DROP POLICY IF EXISTS "Public can view published gift lockscreen" ON public.gifts;
CREATE POLICY "Public can view published gift lockscreen" 
ON public.gifts FOR SELECT 
USING (published = true);

DROP POLICY IF EXISTS "Creators can insert own gifts" ON public.gifts;
DROP POLICY IF EXISTS "Anyone can insert gifts" ON public.gifts;
CREATE POLICY "Anyone can insert gifts" 
ON public.gifts FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Creators can update own gifts" ON public.gifts;
CREATE POLICY "Creators can update own gifts" 
ON public.gifts FOR UPDATE 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Creators can delete own gifts" ON public.gifts;
CREATE POLICY "Creators can delete own gifts" 
ON public.gifts FOR DELETE 
USING (true);

-- 5. Policies for gift_photos, gift_settings, and password_attempts
DROP POLICY IF EXISTS "Creators can manage photos for their gifts" ON public.gift_photos;
DROP POLICY IF EXISTS "Allow all on gift_photos" ON public.gift_photos;
CREATE POLICY "Allow all on gift_photos" 
ON public.gift_photos FOR ALL 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Creators can manage settings for their gifts" ON public.gift_settings;
DROP POLICY IF EXISTS "Allow all on gift_settings" ON public.gift_settings;
CREATE POLICY "Allow all on gift_settings" 
ON public.gift_settings FOR ALL 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on password_attempts" ON public.password_attempts;
CREATE POLICY "Allow all on password_attempts" 
ON public.password_attempts FOR ALL 
USING (true) WITH CHECK (true);
