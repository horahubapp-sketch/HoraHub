import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAgendamentos() {
  console.log('--- Testando agendamentos ---');
  const { data: emps, error: empErr } = await supabase.from('empresas').select('id, nome');
  console.log('Empresas:', emps, empErr);

  const { data: funcs, error: funcErr } = await supabase.from('funcionarios').select('id, nome, tenant_id');
  console.log('Funcionarios:', funcs, funcErr);

  const { data: servs, error: servErr } = await supabase.from('servicos').select('id, nome, tenant_id');
  console.log('Servicos:', servs, servErr);

  const { data: agends, error: agendErr } = await supabase.from('agendamentos').select('*').limit(5);
  console.log('Agendamentos recentes:', agends, agendErr);
}

testAgendamentos();
