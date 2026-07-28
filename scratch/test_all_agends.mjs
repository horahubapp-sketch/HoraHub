import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAll() {
  console.log('--- Buscando TODOS os agendamentos sem filtro de data ---');
  const { data: agends, error } = await supabase
    .from('agendamentos')
    .select('id, tenant_id, cliente_name, horario_inicio, horario_fim, status, created_at')
    .order('created_at', { ascending: false });

  console.log('Erro:', error);
  console.log('Total agendamentos no banco:', agends ? agends.length : 0);
  console.log('Ultimos 10 agendamentos:', JSON.stringify(agends ? agends.slice(0, 10) : [], null, 2));
}

testAll();
