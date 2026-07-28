import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFuncCols() {
  console.log('--- Verificando colunas de funcionarios ---');
  const { data, error } = await supabase.from('funcionarios').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('Colunas de funcionarios:', Object.keys(data[0]));
  } else {
    console.log('Erro ou sem registros:', error);
  }
}

checkFuncCols();
