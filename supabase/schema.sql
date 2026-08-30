-- ============================================================
-- USA POOLS SERVICES - FULL DATABASE SCHEMA
-- Ejecuta TODO este script en Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hvstiubggtgzaeuxhxhy/sql/new
-- ============================================================

-- ============ EXTENSIONS ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ PROFILES TABLE (replica leíble de auth.users) ============
-- Esta tabla es la que lee el panel admin. Se sincroniza AUTOMÁTICAMENTE
-- con auth.users mediante triggers, así NO necesitamos auth.admin.listUsers()
-- que es el endpoint que da "Database error finding users".

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  email_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios autenticados solo pueden ver SU perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- ============ FUNCTION: handle_new_user ============
-- Copia datos de auth.users a profiles cuando se crea un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    phone,
    address,
    avatar_url,
    email_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name',
             (NEW.raw_user_meta_data ->> 'first_name') || ' ' || (NEW.raw_user_meta_data ->> 'last_name')),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.email_confirmed_at,
    NEW.last_sign_in_at,
    NEW.created_at,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============ FUNCTION: handle_update_user ============
-- Sincroniza updates de auth.users hacia profiles
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = NEW.email,
    first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', first_name),
    last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', last_name),
    full_name = COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      (COALESCE(NEW.raw_user_meta_data ->> 'first_name', first_name) || ' ' || COALESCE(NEW.raw_user_meta_data ->> 'last_name', last_name)),
      full_name
    ),
    phone = COALESCE(NEW.raw_user_meta_data ->> 'phone', phone),
    address = COALESCE(NEW.raw_user_meta_data ->> 'address', address),
    avatar_url = COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', avatar_url),
    email_confirmed_at = NEW.email_confirmed_at,
    last_sign_in_at = NEW.last_sign_in_at,
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- ============ TRIGGERS on auth.users ============
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- ============ BACKFILL: copiar usuarios AUTH ya existentes a PROFILES ============
INSERT INTO public.profiles (
  id, email, first_name, last_name, full_name, phone, address, avatar_url,
  email_confirmed_at, last_sign_in_at, created_at, updated_at
)
SELECT
  id,
  email,
  raw_user_meta_data ->> 'first_name',
  raw_user_meta_data ->> 'last_name',
  COALESCE(
    raw_user_meta_data ->> 'full_name',
    (raw_user_meta_data ->> 'first_name') || ' ' || (raw_user_meta_data ->> 'last_name')
  ),
  raw_user_meta_data ->> 'phone',
  raw_user_meta_data ->> 'address',
  raw_user_meta_data ->> 'avatar_url',
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ============ POOL CLOSINGS TABLE (agenda de cierres) ======
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pool_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  preferred_date DATE NOT NULL,
  preferred_time TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pool_closings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create pool closing" ON public.pool_closings;
CREATE POLICY "Anyone can create pool closing" ON public.pool_closings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view own pool closing" ON public.pool_closings;
CREATE POLICY "Authenticated users can view own pool closing" ON public.pool_closings
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR email = (auth.jwt() ->> 'email'));

-- ============================================================
-- ============ CONTRACTS BUCKET =============================
-- ============================================================
DROP POLICY IF EXISTS "Allow uploads contracts" ON storage.objects;
CREATE POLICY "Allow uploads contracts"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'contracts');

DROP POLICY IF EXISTS "Allow reads contracts" ON storage.objects;
CREATE POLICY "Allow reads contracts"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'contracts');

-- ============ INVOICES BUCKET ==============================
DROP POLICY IF EXISTS "Allow uploads invoices" ON storage.objects;
CREATE POLICY "Allow uploads invoices"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Allow reads invoices" ON storage.objects;
CREATE POLICY "Allow reads invoices"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'invoices');

-- ============ REVIEW-PHOTOS BUCKET =========================
DROP POLICY IF EXISTS "Allow uploads review-photos" ON storage.objects;
CREATE POLICY "Allow uploads review-photos"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Allow reads review-photos" ON storage.objects;
CREATE POLICY "Allow reads review-photos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'review-photos');
