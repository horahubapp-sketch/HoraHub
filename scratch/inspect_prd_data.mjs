import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
  console.log('--- Inspecting funcionarios ---');
  const { data: funcs } = await supabase.from('funcionarios').select('id, tenant_id, nome');
  console.log('Funcionarios:', funcs);

  console.log('--- Inspecting empresas ---');
  const { data: empresas } = await supabase.from('empresas').select('id, nome');
  console.log('Empresas:', empresas);
}

inspectData();
