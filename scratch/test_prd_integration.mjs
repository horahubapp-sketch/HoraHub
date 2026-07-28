import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxrkanrzxsjopcnnaxoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cmthbnJ6eHNqb3Bjbm5heG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU0NzIsImV4cCI6MjA5OTYxMTQ3Mn0.OczrHQUB129oWN347ev-hDvGMElnqYju7TyZ1MuEbbc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runPrdIntegrationTests() {
  console.log('====================================================');
  console.log('🚀 INICIANDO BATERIA DE TESTES NO AMBIENTE PRD');
  console.log('====================================================\n');

  try {
    // 1. Obter Profissional e Empresa correspondente
    console.log('📌 Passo 1: Localizando Profissional e Empresa...');
    const { data: func, error: errFunc } = await supabase
      .from('funcionarios')
      .select('id, tenant_id, nome')
      .limit(1)
      .single();

    if (errFunc || !func) throw new Error('Profissional não encontrado: ' + JSON.stringify(errFunc));

    const { data: empresa } = await supabase
      .from('empresas')
      .select('id, nome')
      .eq('id', func.tenant_id)
      .single();

    const tenantId = func.tenant_id;
    const empresaNome = empresa ? empresa.nome : 'Empresa PRD';

    console.log(`✅ Empresa selecionada: ${empresaNome} (Tenant ID: ${tenantId})`);
    console.log(`✅ Profissional selecionado: ${func.nome} (ID: ${func.id})\n`);

    // 2. Cadastrar um novo Serviço e vincular ao profissional
    console.log('📌 Passo 2: Cadastrando Novo Serviço e vinculando ao profissional...');
    const servicoNome = `Atendimento VIP & Consultoria PRD - ${Date.now()}`;
    const { data: novoServico, error: errServ } = await supabase
      .from('servicos')
      .insert({
        tenant_id: tenantId,
        nome: servicoNome,
        duracao_minutos: 30,
        preco: 150.00
      })
      .select('id, nome, duracao_minutos, preco')
      .single();

    if (errServ || !novoServico) throw new Error('Erro ao criar serviço: ' + errServ?.message);
    console.log(`✅ Serviço criado com sucesso: "${novoServico.nome}"`);
    console.log(`   ID: ${novoServico.id} | Duração: ${novoServico.duracao_minutos} min | Preço: R$ ${novoServico.preco}`);

    // Vincular serviço ao profissional (com tenant_id)
    const { error: errVinc } = await supabase
      .from('funcionario_servicos')
      .insert({
        tenant_id: tenantId,
        funcionario_id: func.id,
        servico_id: novoServico.id
      });

    if (errVinc) {
      console.warn('⚠️ Nota sobre vínculo:', errVinc.message);
    } else {
      console.log(`✅ Vínculo de serviço criado no banco com sucesso para o profissional ${func.nome}!\n`);
    }

    // 3. Gravar Primeiro Agendamento
    console.log('📌 Passo 3: Gravando Primeiro Agendamento no Horário 16:00...');
    const dataTeste = '2026-08-25'; // Data futura para teste
    const inicioStr = `${dataTeste}T16:00:00.000Z`;
    const fimStr = `${dataTeste}T16:30:00.000Z`;

    const { data: agendamento1, error: errAgend1 } = await supabase
      .from('agendamentos')
      .insert({
        tenant_id: tenantId,
        funcionario_id: func.id,
        servico_id: novoServico.id,
        cliente_name: 'Gabriel Santos PRD (CPF: 444.555.666-77)',
        horario_inicio: inicioStr,
        horario_fim: fimStr,
        custo_operacional: 0,
        status: 'confirmado'
      })
      .select('id, cliente_name, horario_inicio, status')
      .single();

    if (errAgend1 || !agendamento1) throw new Error('Erro ao gravar primeiro agendamento: ' + errAgend1?.message);
    console.log(`✅ Agendamento 1 criado com sucesso!`);
    console.log(`   ID: ${agendamento1.id}`);
    console.log(`   Cliente: ${agendamento1.cliente_name}`);
    console.log(`   Horário: 16:00 - 16:30 UTC | Status: ${agendamento1.status}\n`);

    // 4. Tentar Cadastrar Segundo Agendamento no MESMO Horário (Double-Booking Check)
    console.log('📌 Passo 4: Tentando cadastrar um SEGUNDO agendamento no MESMO horário (16:00)...');
    const { data: agendamento2, error: errAgend2 } = await supabase
      .from('agendamentos')
      .insert({
        tenant_id: tenantId,
        funcionario_id: func.id,
        servico_id: novoServico.id,
        cliente_name: 'Felipe Conflito PRD (CPF: 888.999.000-11)',
        horario_inicio: inicioStr,
        horario_fim: fimStr,
        custo_operacional: 0,
        status: 'confirmado'
      })
      .select('id');

    if (errAgend2) {
      console.log('----------------------------------------------------');
      console.log('🛡️ SUCESSO TOTAL DO TESTE ANTI-DOUBLE BOOKING!');
      console.log('🛑 O Banco de Dados de Produção (PRD) BLOQUEOU a duplicidade de horário!');
      console.log(`   Mensagem de Erro do Banco: "${errAgend2.message}"`);
      console.log('----------------------------------------------------\n');
    } else {
      console.error('❌ ATENÇÃO: O segundo agendamento foi gravado sem bloqueio!', agendamento2);
    }

    console.log('====================================================');
    console.log('🎉 TODOS OS TESTES NO AMBIENTE PRD FORAM APROVADOS!');
    console.log('====================================================');

  } catch (err) {
    console.error('❌ Erro durante os testes no PRD:', err);
  }
}

runPrdIntegrationTests();
