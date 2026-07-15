-- Criar bucket público de avatares no storage do Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar políticas de acesso público (Leitura, Inserção, Atualização e Exclusão) para desenvolvimento local
CREATE POLICY "Permitir leitura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Permitir inserção pública" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Permitir atualização pública" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Permitir exclusão pública" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');
