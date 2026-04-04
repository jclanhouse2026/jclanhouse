
-- =====================================================================================
-- SCRIPT FINAL: POLÍTICAS DE SEGURANÇA PARA O STORAGE (ARMAZENAMENTO DE ARQUIVOS)
-- Copie e cole TODO este código no SQL Editor do seu projeto Supabase e clique em 'RUN'.
-- =====================================================================================

-- --- Políticas para o bucket 'portfolio' (Imagens de produtos) ---

-- Permite que administradores façam upload de imagens.
DROP POLICY IF EXISTS "Allow admin inserts on portfolio" ON storage.objects;
CREATE POLICY "Allow admin inserts on portfolio" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());

-- Permite que administradores vejam e atualizem as imagens.
DROP POLICY IF EXISTS "Allow admin updates on portfolio" ON storage.objects;
CREATE POLICY "Allow admin updates on portfolio" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin());

-- Permite que administradores apaguem imagens.
DROP POLICY IF EXISTS "Allow admin deletes on portfolio" ON storage.objects;
CREATE POLICY "Allow admin deletes on portfolio" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin());

-- Permite que qualquer pessoa (mesmo não logada) veja as imagens.
DROP POLICY IF EXISTS "Allow public read access on portfolio" ON storage.objects;
CREATE POLICY "Allow public read access on portfolio" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');


-- --- Políticas para o bucket 'themes' (Imagens de temas) ---

-- Permite que administradores façam upload de imagens.
DROP POLICY IF EXISTS "Allow admin inserts on themes" ON storage.objects;
CREATE POLICY "Allow admin inserts on themes" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'themes' AND public.is_admin());
  
-- Permite que administradores atualizem imagens.
DROP POLICY IF EXISTS "Allow admin updates on themes" ON storage.objects;
CREATE POLICY "Allow admin updates on themes" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'themes' AND public.is_admin());

-- Permite que administradores apaguem imagens.
DROP POLICY IF EXISTS "Allow admin deletes on themes" ON storage.objects;
CREATE POLICY "Allow admin deletes on themes" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'themes' AND public.is_admin());
  
-- Permite que qualquer pessoa (mesmo não logada) veja as imagens.
DROP POLICY IF EXISTS "Allow public read access on themes" ON storage.objects;
CREATE POLICY "Allow public read access on themes" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'themes');


-- --- Políticas para o bucket 'avatars' (Fotos de perfil dos usuários) ---

-- Permite que usuários autenticados façam upload de seus próprios avatares.
DROP POLICY IF EXISTS "Allow authenticated inserts on avatars" ON storage.objects;
CREATE POLICY "Allow authenticated inserts on avatars" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Permite que usuários atualizem seus próprios avatares, ou que admins atualizem qualquer avatar.
DROP POLICY IF EXISTS "Allow user and admin updates on avatars" ON storage.objects;
CREATE POLICY "Allow user and admin updates on avatars" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid() = owner OR public.is_admin()));

-- Permite que usuários apaguem seus próprios avatares, ou que admins apaguem qualquer avatar.
DROP POLICY IF EXISTS "Allow user and admin deletes on avatars" ON storage.objects;
CREATE POLICY "Allow user and admin deletes on avatars" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid() = owner OR public.is_admin()));

-- Permite que qualquer pessoa veja os avatares (são públicos).
DROP POLICY IF EXISTS "Allow public read access on avatars" ON storage.objects;
CREATE POLICY "Allow public read access on avatars" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
