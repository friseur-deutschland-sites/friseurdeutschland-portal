-- Portal tables for FriseurDeutschland
-- Run this in Supabase SQL Editor after the main schema

-- ─── PORTAL USERS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  can_self_create BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── PRICING PLANS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing_plans (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  features    JSONB DEFAULT '[]',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Starter plan
INSERT INTO pricing_plans (name, price, description, features, is_active)
VALUES (
  'Starter', 199,
  'Perfekt für kleine Friseursalons.',
  '["Professionelle Website", "Online-Terminbuchung", "SSL-Zertifikat", "Mobile-optimiert", "1 Jahr Laufzeit"]',
  TRUE
) ON CONFLICT DO NOTHING;

-- Pro plan (featured)
INSERT INTO pricing_plans (name, price, description, features, is_featured, is_active)
VALUES (
  'Professional', 299,
  'Für wachsende Salons mit mehr Bedarf.',
  '["Alles aus Starter", "Eigene Domain", "Galerie & Preisliste", "Google Maps Integration", "Bewertungssystem", "1 Jahr Laufzeit"]',
  TRUE, TRUE
) ON CONFLICT DO NOTHING;

-- Premium plan
INSERT INTO pricing_plans (name, price, description, features, is_active)
VALUES (
  'Premium', 499,
  'Vollständige Lösung für professionelle Salons.',
  '["Alles aus Professional", "Logo-Design KI", "Individuelle Anpassungen", "Prioritäts-Support", "Mehrsprachigkeit", "1 Jahr Laufzeit"]',
  TRUE
) ON CONFLICT DO NOTHING;

-- ─── BILLING RECORDS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS billing_records (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id       UUID REFERENCES salon_projects(project_id) ON DELETE SET NULL,
  user_id          UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  plan_id          UUID REFERENCES pricing_plans(id) ON DELETE SET NULL,
  amount           NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  paypal_order_id  TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── LISTINGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_name      TEXT NOT NULL,
  city            TEXT,
  website_url     TEXT,
  logo_url        TEXT,
  cover_photo_url TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── PORTAL SETTINGS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO portal_settings (key, value) VALUES
  ('self_registration_enabled', 'true'),
  ('site_title', 'FriseurDeutschland'),
  ('support_email', 'info@friseurdeutschland.de'),
  ('telegram_bot_link', '')
ON CONFLICT (key) DO NOTHING;

-- ─── SALON PROJECTS EXTRA COLUMNS ────────────────────────────────────────────
-- Add portal-related columns if they don't exist
ALTER TABLE salon_projects
  ADD COLUMN IF NOT EXISTS user_id          UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS plan_id          UUID REFERENCES pricing_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expires_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pipeline_trigger TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS city             TEXT,
  ADD COLUMN IF NOT EXISTS logo_url         TEXT,
  ADD COLUMN IF NOT EXISTS cover_photo_url  TEXT,
  ADD COLUMN IF NOT EXISTS latitude         DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude        DOUBLE PRECISION;

-- ─── PUBLIC_SALONS VIEW ───────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public_salons AS
SELECT
  project_id,
  salon_name,
  city,
  address,
  live_url,
  logo_url,
  cover_photo_url,
  latitude,
  longitude,
  status,
  created_at
FROM salon_projects
WHERE status = 'completed'
  AND live_url IS NOT NULL
  AND live_url != '';

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
-- Disable RLS for portal tables (service role key handles auth server-side)
ALTER TABLE portal_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE portal_settings DISABLE ROW LEVEL SECURITY;

-- ─── INITIAL ADMIN USER ──────────────────────────────────────────────────────
-- Run this separately after hashing a password via Node.js:
-- const bcrypt = require('bcryptjs');
-- console.log(bcrypt.hashSync('your-password', 12));
--
-- INSERT INTO portal_users (email, password_hash, role, is_active)
-- VALUES ('admin@friseurdeutschland.de', '<bcrypt-hash>', 'admin', TRUE);
