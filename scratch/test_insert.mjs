import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('--- Testando inserção no Supabase ---');
  const { data, error } = await supabase.from('agendamentos').insert({
    tenant_id: 'e1a3bc08-cb86-4e55-926c-d2c6c06a3eb7',
    funcionario_id: 'f1a3bc08-cb86-4e55-926c-d2c6c06a3eb1',
    cliente_name: 'Cliente Teste Direct',
    servico_id: 'c1a3bc08-cb86-4e55-926c-d2c6c06a3eb1',
    horario_inicio: new Date().toISOString(),
    horario_fim: new Date(Date.now() + 30*60*1000).toISOString(),
    status: 'confirmado'
  }).select().single();

  console.log('Resultado da Inserção:', data, error);
}

testInsert();
