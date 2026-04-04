
-- =====================================================================================
-- SCRIPT DE ESTRUTURA COMPLETA DO BANCO DE DADOS PARA JC LAN HOUSE
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ISSO IRÁ APAGAR DADOS EXISTENTES NAS TABELAS COM O MESMO NOME PARA GARANTIR UMA INSTALAÇÃO LIMPA.
-- =====================================================================================

BEGIN;

-- 1. EXTENSÕES (Se não estiverem ativas)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FUNÇÃO AUXILIAR PARA VERIFICAR SE O USUÁRIO É ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. TABELA DE PERFIS DE USUÁRIOS (profiles)
-- Armazena dados adicionais dos usuários do sistema.
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    name text,
    avatar_url text,
    role text DEFAULT 'client'::text,
    is_premium boolean DEFAULT false,
    has_billing boolean DEFAULT false,
    pdv_access_status text DEFAULT 'none'::text,
    status text DEFAULT 'active'::text
);
COMMENT ON TABLE public.profiles IS 'Stores additional user profile information.';

-- 4. GATILHO PARA CRIAR UM PERFIL QUANDO UM NOVO USUÁRIO SE CADASTRA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
  INSERT INTO public.profiles (id, name, username, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. POLÍTICAS DE ACESSO (RLS) PARA A TABELA DE PERFIS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;
CREATE POLICY "Allow individual update access" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;
CREATE POLICY "Allow admin full access" ON public.profiles FOR ALL USING (public.is_admin());


-- 6. TABELAS DO PORTFÓLIO E PRODUTOS
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id uuid REFERENCES auth.users(id)
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin all on categories" ON public.categories FOR ALL USING (public.is_admin());

DROP TABLE IF EXISTS public.subcategories CASCADE;
CREATE TABLE public.subcategories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INT REFERENCES public.categories(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id)
);
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Allow admin all on subcategories" ON public.subcategories FOR ALL USING (public.is_admin());

DROP TABLE IF EXISTS public.portfolio_products CASCADE;
CREATE TABLE public.portfolio_products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    original_price NUMERIC(10, 2) NOT NULL,
    promo_price NUMERIC(10, 2),
    type TEXT NOT NULL DEFAULT 'unique',
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id INT REFERENCES public.subcategories(id) ON DELETE SET NULL,
    user_id uuid REFERENCES auth.users(id)
);
ALTER TABLE public.portfolio_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on portfolio_products" ON public.portfolio_products FOR SELECT USING (true);
CREATE POLICY "Allow admin all on portfolio_products" ON public.portfolio_products FOR ALL USING (public.is_admin());

DROP TABLE IF EXISTS public.portfolio_images CASCADE;
CREATE TABLE public.portfolio_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES public.portfolio_products(id) ON DELETE CASCADE,
    url TEXT NOT NULL
);
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on portfolio_images" ON public.portfolio_images FOR SELECT USING (true);
CREATE POLICY "Allow admin all on portfolio_images" ON public.portfolio_images FOR ALL USING (public.is_admin());

-- 7. TABELA DE TEMAS (CADERNETA, ESCOLAR, ETC)
DROP TABLE IF EXISTS public.themes CASCADE;
CREATE TABLE public.themes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'MENINO', 'MENINA', 'UNISSEX'
    image_url TEXT NOT NULL,
    user_id uuid REFERENCES auth.users(id)
);
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on themes" ON public.themes FOR SELECT USING (true);
CREATE POLICY "Allow admin all on themes" ON public.themes FOR ALL USING (public.is_admin());

-- 8. TABELA "MEUS TRABALHOS" (VÍDEOS)
DROP TABLE IF EXISTS public.my_works CASCADE;
CREATE TABLE public.my_works (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.my_works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on my_works" ON public.my_works FOR SELECT USING (true);
CREATE POLICY "Allow admin all on my_works" ON public.my_works FOR ALL USING (public.is_admin());


-- 9. TABELAS DE CONFIGURAÇÃO DO SITE (Singleton)
DROP TABLE IF EXISTS public.home_settings;
CREATE TABLE public.home_settings (
    id INT PRIMARY KEY DEFAULT 1,
    settings JSONB
);
ALTER TABLE public.home_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on home_settings" ON public.home_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin all on home_settings" ON public.home_settings FOR ALL USING (public.is_admin());

DROP TABLE IF EXISTS public.service_settings;
CREATE TABLE public.service_settings (
    id SERIAL PRIMARY KEY,
    icon TEXT,
    title TEXT,
    description TEXT,
    link TEXT
);
ALTER TABLE public.service_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on service_settings" ON public.service_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin all on service_settings" ON public.service_settings FOR ALL USING (public.is_admin());

DROP TABLE IF EXISTS public.service_pricing;
CREATE TABLE public.service_pricing (
    id INT PRIMARY KEY DEFAULT 1,
    config JSONB
);
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on service_pricing" ON public.service_pricing FOR SELECT USING (true);
CREATE POLICY "Allow admin all on service_pricing" ON public.service_pricing FOR ALL USING (public.is_admin());

DROP TABLE IF EXISTS public.company_info;
CREATE TABLE public.company_info (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text, cnpj text, phone text, email text, address text, zip text, logo text
);
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user read own company info" ON public.company_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow admin read all company info" ON public.company_info FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin update company info" ON public.company_info FOR UPDATE USING (public.is_admin());


-- 10. TABELAS DO SISTEMA PDV (VENDAS, DESPESAS)
DROP TABLE IF EXISTS public.sales CASCADE;
CREATE TABLE public.sales (
    id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    customer_name TEXT,
    phone TEXT,
    total NUMERIC(10, 2),
    amount_paid NUMERIC(10, 2),
    payment_method TEXT,
    date_time TIMESTAMPTZ DEFAULT now(),
    items JSONB
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user manage own sales" ON public.sales FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow admin manage all sales" ON public.sales FOR ALL USING (public.is_admin());

DROP TABLE IF EXISTS public.expenses CASCADE;
CREATE TABLE public.expenses (
    id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    date_time TIMESTAMPTZ DEFAULT now(),
    expense_type TEXT,
    description TEXT NOT NULL,
    observation TEXT,
    supplier TEXT,
    category TEXT,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user manage own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow admin manage all expenses" ON public.expenses FOR ALL USING (public.is_admin());


-- 11. TABELA DE CLIENTES
DROP TABLE IF EXISTS public.customers CASCADE;
CREATE TABLE public.customers (
    id SERIAL PRIMARY KEY,
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- Ligado ao usuário do sistema, se houver
    full_name TEXT NOT NULL,
    cpf TEXT,
    email TEXT,
    phone TEXT,
    address JSONB,
    dob DATE,
    avatar_url TEXT,
    status TEXT DEFAULT 'Ativo',
    signup_date TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user read own customer data" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow admin manage all customers" ON public.customers FOR ALL USING (public.is_admin());
CREATE POLICY "Allow authenticated to insert customers" ON public.customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow user to update own customer data" ON public.customers FOR UPDATE USING (auth.uid() = user_id);


-- 12. TABELAS DO CONSTRUTOR DE CURRÍCULO
DROP TABLE IF EXISTS public.resume_config;
CREATE TABLE public.resume_config (
    id INT PRIMARY KEY DEFAULT 1,
    config JSONB
);
ALTER TABLE public.resume_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on resume_config" ON public.resume_config FOR SELECT USING (true);
CREATE POLICY "Allow admin all on resume_config" ON public.resume_config FOR ALL USING (public.is_admin());

DROP TABLE IF EXISTS public.resume_requests;
CREATE TABLE public.resume_requests (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    user_name TEXT NOT NULL,
    user_whatsapp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'authorized'
    requested_at TIMESTAMPTZ DEFAULT now(),
    resume_data JSONB NOT NULL
);
ALTER TABLE public.resume_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user manage own resume_requests" ON public.resume_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow admin manage all resume_requests" ON public.resume_requests FOR ALL USING (public.is_admin());

-- 13. TABELA DE IMPRESSORAS
DROP TABLE IF EXISTS public.printers CASCADE;
CREATE TABLE public.printers (
    id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    connection_type TEXT NOT NULL, -- 'usb' | 'network' | 'serial' | 'bluetooth'
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false
);
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user manage own printers" ON public.printers FOR ALL USING (auth.uid() = user_id);


-- 14. INSERIR DADOS INICIAIS (SINGLETON TABLES)
-- Insere uma linha vazia para que o `update` funcione na primeira vez.
INSERT INTO public.home_settings (id, settings) VALUES (1, '{}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.service_pricing (id, config) VALUES (1, '{}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.resume_config (id, config) VALUES (1, '{}') ON CONFLICT (id) DO NOTHING;


COMMIT;
