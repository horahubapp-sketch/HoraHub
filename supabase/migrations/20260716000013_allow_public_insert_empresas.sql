-- Permitir que novos cadastros insiram a empresa na tabela empresas (mesmo sem e-mail confirmado ainda)
DROP POLICY IF EXISTS "Permitir insercao publica de empresas" ON empresas;
CREATE POLICY "Permitir insercao publica de empresas" ON empresas
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
