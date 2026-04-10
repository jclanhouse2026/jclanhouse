/**
 * SQL Schema for JC Lan House System
 * This script creates all necessary tables, triggers, and functions.
 * It uses IF NOT EXISTS to be idempotent.
 */
export const SCHEMA_SQL = `
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. TABLES

-- Profiles (User data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'client',
  avatar_url TEXT,
  photo_url TEXT,
  pdv_access_status TEXT DEFAULT 'none',
  status TEXT DEFAULT 'active',
  is_premium BOOLEAN DEFAULT false,
  has_billing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  subcategories JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cpf TEXT,
  dob DATE,
  avatar_url TEXT,
  address JSONB DEFAULT '{}',
  status TEXT DEFAULT 'Ativo',
  signup_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General Orders (Portfolio Products)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address JSONB NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Products
CREATE TABLE IF NOT EXISTS portfolio_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes (Caderneta, Escolar, Caneca)
CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'caderneta', 'escolar', 'caneca'
  image_url TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theme Orders
CREATE TABLE IF NOT EXISTS theme_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  theme_id UUID REFERENCES themes(id),
  details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales (PDV)
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  items JSONB DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  customer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apostila Settings
CREATE TABLE IF NOT EXISTS apostila_settings (
  id TEXT PRIMARY KEY,
  price_bw DECIMAL(10,2) DEFAULT 0.15,
  price_color DECIMAL(10,2) DEFAULT 1.00,
  price_spiral DECIMAL(10,2) DEFAULT 5.00,
  price_wireo DECIMAL(10,2) DEFAULT 15.00,
  limit_spiral INTEGER DEFAULT 400,
  limit_wireo INTEGER DEFAULT 100,
  enable_double_sided BOOLEAN DEFAULT true,
  enable_spiral BOOLEAN DEFAULT true,
  enable_wireo BOOLEAN DEFAULT true,
  min_delivery_days INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apostila Colors
CREATE TABLE IF NOT EXISTS apostila_colors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  hex TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apostila Orders
CREATE TABLE IF NOT EXISTS apostila_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  order_number TEXT UNIQUE,
  title TEXT,
  print_type TEXT,
  pages INTEGER,
  sides TEXT,
  binding TEXT,
  cover_color TEXT,
  delivery_date TEXT,
  quantity INTEGER,
  subtotal DECIMAL(10,2),
  total DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- General Settings
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  site_name TEXT DEFAULT 'JC Lan House',
  site_description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  social_links JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Home Page Settings
CREATE TABLE IF NOT EXISTS home_settings (
  id TEXT PRIMARY KEY,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image TEXT,
  features JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Info
CREATE TABLE IF NOT EXISTS company_info (
  id TEXT PRIMARY KEY,
  name TEXT,
  cnpj TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- My Works (Portfolio)
CREATE TABLE IF NOT EXISTS my_works (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume Requests (Currículos)
CREATE TABLE IF NOT EXISTS resume_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suggestions
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INITIAL DATA
INSERT INTO apostila_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
INSERT INTO settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
INSERT INTO home_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
INSERT INTO company_info (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 5. TRIGGERS
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_update_updated_at ON %I', t);
        EXECUTE format('CREATE TRIGGER tr_update_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
    END LOOP;
END $$;

-- 6. RLS (Row Level Security)
-- Enable RLS for all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;
`;
