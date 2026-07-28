import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoad() {
  console.log('--- Testando consulta exata de loadAgendamentos ---');
  const tenantId = 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7';
  const inicioDia = '2026-07-27T00:00:00Z';
  const fimDia = '2026-07-27T23:59:59Z';

  const { data: dbAgends, error } = await supabase
    .from('agendamentos')
    .select(`
      id,
      tenant_id,
      funcionario_id,
      cliente_name,
      horario_inicio,
      horario_fim,
      status,
      servicos ( nome, preco )
    `)
    .eq('tenant_id', tenantId)
    .gte('horario_inicio', inicioDia)
    .lte('horario_inicio', fimDia)
    .neq('status', 'cancelado');

  console.log('Erro na busca:', error);
  console.log('Agendamentos retornados:', JSON.stringify(dbAgends, null, 2));
}

testLoad();
