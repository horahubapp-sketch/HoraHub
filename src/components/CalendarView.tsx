import { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  TrendingUp, 
  Check, 
  AlertCircle, 
  Coffee, 
  User, 
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { FUNCIONARIOS_MOCK } from '../mockData';
import type { Funcionario, Agendamento } from '../mockData';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import './CalendarView.css';

const START_HOUR = 8;
const END_HOUR = 20;
const ROW_HEIGHT = 65; // px para cada intervalo de 30 minutos

interface Servico {
  id: string;
  nome: string;
  duracao_minutos: number;
  preco: number;
}

export const CalendarView = () => {
  const { tenantId } = useAuth();

  // Sincronização com LocalStorage para dados em modo demo
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [catalogoServicos, setCatalogoServicos] = useState<Servico[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  
  // Controle Dinâmico de Data
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-07-14')); // Inicia na data do mock

  // Carregar dados de Funcionários e Serviços do LocalStorage (ou mocks se vazios)
  useEffect(() => {
    const localFuncs = localStorage.getItem('horahub_funcionarios_demo');
    if (localFuncs) {
      setFuncionarios(JSON.parse(localFuncs));
    } else {
      setFuncionarios(FUNCIONARIOS_MOCK);
      localStorage.setItem('horahub_funcionarios_demo', JSON.stringify(FUNCIONARIOS_MOCK));
    }

    const localServs = localStorage.getItem('horahub_servicos_demo');
    if (localServs) {
      setCatalogoServicos(JSON.parse(localServs));
    } else {
      const mockServs = [
        { id: 's-mock-1', nome: 'Corte Degradê', duracao_minutos: 45, preco: 60.00 },
        { id: 's-mock-2', nome: 'Barboterapia', duracao_minutos: 30, preco: 40.00 },
        { id: 's-mock-3', nome: 'Corte Degradê + Barba', duracao_minutos: 60, preco: 90.00 }
      ];
      setCatalogoServicos(mockServs);
      localStorage.setItem('horahub_servicos_demo', JSON.stringify(mockServs));
    }
  }, []);

  const formatarData = (date: Date): string => {
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const diaSemana = diasSemana[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    
    return `${diaSemana}, ${dia} de ${mes}`;
  };

  const obterDataKey = (date: Date): string => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  // Carregar agendamentos do dia selecionado
  useEffect(() => {
    if (funcionarios.length === 0) return;
    
    const dataKey = obterDataKey(currentDate);
    
    async function loadAgendamentos() {
      if (!tenantId) return;
      try {
        const inicioDia = `${dataKey}T00:00:00Z`;
        const fimDia = `${dataKey}T23:59:59Z`;

        const { data: dbAgends, error } = await supabase
          .from('agendamentos')
          .select(`
            id,
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

        if (error) throw error;

        // Mapear dados do banco para o formato de Agendamento local (HH:MM)
        const dbMapeados: Agendamento[] = (dbAgends || []).map(a => {
          const dInicio = new Date(a.horario_inicio);
          const dFim = new Date(a.horario_fim);
          
          const pad = (n: number) => String(n).padStart(2, '0');
          const hInicio = `${pad(dInicio.getUTCHours())}:${pad(dInicio.getUTCMinutes())}`;
          const hFim = `${pad(dFim.getUTCHours())}:${pad(dFim.getUTCMinutes())}`;

          return {
            id: a.id,
            funcionarioId: a.funcionario_id,
            clienteNome: a.cliente_name,
            servicoNome: (a.servicos as any)?.nome || 'Serviço',
            horarioInicio: hInicio,
            horarioFim: hFim,
            status: a.status as 'confirmado' | 'pendente' | 'bloqueio',
            preco: (a.servicos as any)?.preco ? Number((a.servicos as any).preco) : undefined
          };
        });

        // Combinar os agendamentos do Supabase com os bloqueios de almoço locais do localStorage
        const agendamentosSalvos = localStorage.getItem(`horahub_agendamentos_${dataKey}`);
        let locais = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];
        
        // Filtrar locais para manter apenas os que são do tipo 'bloqueio'
        const bloqueiosLocais = locais.filter((l: any) => l.status === 'bloqueio');

        // Se for a primeira vez e não tiver bloqueios locais salvos, cria os bloqueios padrão
        if (bloqueiosLocais.length === 0) {
          const bloqueiosPadrao = funcionarios.map((f, index) => {
            const horasAlmoco = [['12:00', '13:00'], ['13:00', '14:00'], ['12:30', '13:30'], ['12:00', '13:00']];
            const [inicio, fim] = horasAlmoco[index % horasAlmoco.length];
            return {
              id: `bloqueio-almoco-${f.id}-${dataKey}`,
              funcionarioId: f.id,
              clienteNome: 'Almoço',
              servicoNome: 'Intervalo',
              horarioInicio: inicio,
              horarioFim: fim,
              status: 'bloqueio' as const
            };
          });
          setAgendamentos([...bloqueiosPadrao, ...dbMapeados]);
          localStorage.setItem(`horahub_agendamentos_${dataKey}`, JSON.stringify([...bloqueiosPadrao, ...dbMapeados]));
        } else {
          setAgendamentos([...bloqueiosLocais, ...dbMapeados]);
        }
      } catch (err) {
        console.error('[HoraHub] Erro ao carregar agendamentos do Supabase:', err);
        // Fallback completo do localStorage se estiver offline
        const agendamentosSalvos = localStorage.getItem(`horahub_agendamentos_${dataKey}`);
        if (agendamentosSalvos) {
          setAgendamentos(JSON.parse(agendamentosSalvos));
        }
      }
    }

    loadAgendamentos();
  }, [currentDate, funcionarios, tenantId]);

  const salvarAgendamentosDaData = (novaLista: Agendamento[]) => {
    const dataKey = obterDataKey(currentDate);
    setAgendamentos(novaLista);
    localStorage.setItem(`horahub_agendamentos_${dataKey}`, JSON.stringify(novaLista));
  };

  const handlePrevDay = () => {
    const nova = new Date(currentDate);
    nova.setDate(nova.getDate() - 1);
    setCurrentDate(nova);
  };

  const handleNextDay = () => {
    const nova = new Date(currentDate);
    nova.setDate(nova.getDate() + 1);
    setCurrentDate(nova);
  };

  // States do Formulário de Novo Agendamento
  const [newClient, setNewClient] = useState('');
  const [newFuncionario, setNewFuncionario] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newPrice, setNewPrice] = useState('50,00'); // Em R$
  const [newTimeStart, setNewTimeStart] = useState('09:00');
  const [newTimeEnd, setNewTimeEnd] = useState('09:45');

  // Inicializar o formulário com o primeiro profissional e seu primeiro serviço correspondente
  useEffect(() => {
    if (funcionarios.length > 0 && showNewModal) {
      const primeiroFunc = funcionarios[0].id;
      setNewFuncionario(primeiroFunc);
      
      const servicosValidos = getServicosDoProfissional(primeiroFunc);
      if (servicosValidos.length > 0) {
        const primeiroServ = servicosValidos[0];
        setNewServiceId(primeiroServ.id);
        setNewPrice(Number(primeiroServ.preco).toFixed(2).replace('.', ','));
        atualizarHoraFim(newTimeStart, primeiroServ.duracao_minutos);
      }
    }
  }, [funcionarios, showNewModal]);

  // Retorna os serviços que o colaborador executa
  const getServicosDoProfissional = (funcId: string): Servico[] => {
    const func = funcionarios.find(f => f.id === funcId) as any;
    if (func && func.servicos_ids && func.servicos_ids.length > 0) {
      return catalogoServicos.filter(s => func.servicos_ids.includes(s.id));
    }
    // Fallback: se for mock sem associação, mostra todo o catálogo
    return catalogoServicos;
  };

  // Atualizar hora de término com base na início + duração do serviço
  const atualizarHoraFim = (inicio: string, duracaoMinutos: number) => {
    const [h, m] = inicio.split(':').map(Number);
    const totalMinutos = h * 60 + m + duracaoMinutos;
    const novasHoras = Math.floor(totalMinutos / 60) % 24;
    const novosMinutos = totalMinutos % 60;
    const fimFormatado = `${String(novasHoras).padStart(2, '0')}:${String(novosMinutos).padStart(2, '0')}`;
    setNewTimeEnd(fimFormatado);
  };

  // Tratar alteração do Profissional selecionado no Form
  const handleFuncionarioChange = (funcId: string) => {
    setNewFuncionario(funcId);
    setConflictError(null);

    // Ajustar ComboBox de Serviços baseado no novo profissional
    const servs = getServicosDoProfissional(funcId);
    if (servs.length > 0) {
      const primeiroServ = servs[0];
      setNewServiceId(primeiroServ.id);
      setNewPrice(Number(primeiroServ.preco).toFixed(2).replace('.', ','));
      atualizarHoraFim(newTimeStart, primeiroServ.duracao_minutos);
    } else {
      setNewServiceId('');
      setNewPrice('0,00');
    }
  };

  // Tratar alteração do Serviço selecionado no Form
  const handleServicoChange = (servId: string) => {
    setNewServiceId(servId);
    setConflictError(null);

    const serv = catalogoServicos.find(s => s.id === servId);
    if (serv) {
      setNewPrice(Number(serv.preco).toFixed(2).replace('.', ','));
      atualizarHoraFim(newTimeStart, serv.duracao_minutos);
    }
  };

  // Tratar alteração da Hora de Início selecionada no Form
  const handleTimeStartChange = (inicio: string) => {
    setNewTimeStart(inicio);
    setConflictError(null);

    const serv = catalogoServicos.find(s => s.id === newServiceId);
    if (serv) {
      atualizarHoraFim(inicio, serv.duracao_minutos);
    }
  };

  // Gerar array com todos os horários de 30 em 30 min de START_HOUR até END_HOUR
  const timeSlots: string[] = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
    timeSlots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  timeSlots.push(`${String(END_HOUR).padStart(2, '0')}:00`);

  // Funções Auxiliares de Cálculo de Tempo
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const startDayMinutes = START_HOUR * 60; // 480 min

  const calculatePosition = (horarioInicio: string, horarioFim: string) => {
    const startMins = timeToMinutes(horarioInicio);
    const endMins = timeToMinutes(horarioFim);
    
    const top = ((startMins - startDayMinutes) / 30) * ROW_HEIGHT;
    const height = ((endMins - startMins) / 30) * ROW_HEIGHT;
    
    return { top, height };
  };

  // Helper para verificar se o horário do slot de agendamento já passou no dia selecionado
  const isSlotNoPassado = (horarioFimStr: string, dateObj: Date) => {
    const agora = new Date();
    const dataSlot = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const [horas, minutos] = horarioFimStr.split(':').map(Number);
    dataSlot.setHours(horas, minutos, 0, 0);
    return dataSlot < agora;
  };

  // Estatísticas Rápidas
  const agendamentosReais = agendamentos.filter(a => a.status !== 'bloqueio');
  const totalConfirmados = agendamentosReais.filter(a => a.status === 'confirmado' && !isSlotNoPassado(a.horarioFim, currentDate)).length;
  const totalPendentes = agendamentosReais.filter(a => a.status === 'pendente').length;
  const totalExecutados = agendamentosReais.filter(a => a.status === 'confirmado' && isSlotNoPassado(a.horarioFim, currentDate)).length;
  const faturamentoEstimado = agendamentos
    .filter(a => a.status !== 'bloqueio')
    .reduce((sum, a) => sum + (a.preco || 0), 0);

  // VALIDAÇÕES
  const validarHorarios = (inicio: string, fim: string): string | null => {
    const inicioMin = timeToMinutes(inicio);
    const fimMin = timeToMinutes(fim);
    if (fimMin <= inicioMin) {
      return `Horário inválido: a hora de término (${fim}) deve ser posterior à hora de início (${inicio}).`;
    }
    return null;
  };

  const verificarConflito = (funcionarioId: string, inicio: string, fim: string): Agendamento | null => {
    const novoInicio = timeToMinutes(inicio);
    const novoFim = timeToMinutes(fim);

    const agendamentoConflitante = agendamentos.find(a => {
      if (a.funcionarioId !== funcionarioId) return false;
      if (a.status === 'bloqueio') return false;

      const existInicio = timeToMinutes(a.horarioInicio);
      const existFim = timeToMinutes(a.horarioFim);

      if (existFim <= existInicio) return false;

      return novoInicio < existFim && existInicio < novoFim;
    }) || null;

    return agendamentoConflitante;
  };

  // Manipular Adição de Agendamento
  const handleCreateAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newServiceId) return;

    const erroHorario = validarHorarios(newTimeStart, newTimeEnd);
    if (erroHorario) {
      setConflictError(erroHorario);
      return;
    }

    const conflito = verificarConflito(newFuncionario, newTimeStart, newTimeEnd);
    if (conflito) {
      const profNome = funcionarios.find(f => f.id === newFuncionario)?.nome || 'este profissional';
      setConflictError(
        `Horário já ocupado! ${profNome} tem "${conflito.clienteNome}" das ${conflito.horarioInicio} às ${conflito.horarioFim}. Escolha outro horário.`
      );
      return;
    }

    const servObj = catalogoServicos.find(s => s.id === newServiceId);
    const precoTratado = Number(newPrice.replace('R$', '').replace(',', '.').trim());

    // Gerar DateTimes corretos em UTC para gravação no Supabase
    const [hStart, mStart] = newTimeStart.split(':').map(Number);
    const [hEnd, mEnd] = newTimeEnd.split(':').map(Number);

    const dInicio = new Date(currentDate);
    dInicio.setHours(hStart, mStart, 0, 0);

    const dFim = new Date(currentDate);
    dFim.setHours(hEnd, mEnd, 0, 0);

    try {
      const { data: inserted, error } = await supabase
        .from('agendamentos')
        .insert({
          tenant_id: tenantId,
          funcionario_id: newFuncionario,
          cliente_name: newClient,
          servico_id: newServiceId,
          horario_inicio: dInicio.toISOString(),
          horario_fim: dFim.toISOString(),
          status: 'confirmado'
        })
        .select()
        .single();

      if (error) throw error;

      const newAgenda: Agendamento = {
        id: inserted.id,
        funcionarioId: newFuncionario,
        clienteNome: newClient,
        servicoNome: servObj?.nome || 'Serviço',
        horarioInicio: newTimeStart,
        horarioFim: newTimeEnd,
        status: 'confirmado',
        preco: isNaN(precoTratado) ? (servObj?.preco || 50) : precoTratado
      };

      salvarAgendamentosDaData([...agendamentos, newAgenda]);
    } catch (err) {
      console.error('[HoraHub] Erro ao gravar agendamento no Supabase:', err);
      // Fallback local se estiver offline
      const newAgenda: Agendamento = {
        id: `a-${Date.now()}`,
        funcionarioId: newFuncionario,
        clienteNome: newClient,
        servicoNome: servObj?.nome || 'Serviço',
        horarioInicio: newTimeStart,
        horarioFim: newTimeEnd,
        status: 'confirmado',
        preco: isNaN(precoTratado) ? (servObj?.preco || 50) : precoTratado
      };
      salvarAgendamentosDaData([...agendamentos, newAgenda]);
    }
    
    setNewClient('');
    setConflictError(null);
    setShowNewModal(false);
  };

  // Alterar Status
  const handleToggleStatus = async (id: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const nextStatus: 'confirmado' | 'pendente' = selectedAgendamento?.status === 'confirmado' ? 'pendente' : 'confirmado';
    
    if (isUUID) {
      try {
        await supabase
          .from('agendamentos')
          .update({ status: nextStatus })
          .eq('id', id);
      } catch (err) {
        console.error('[HoraHub] Erro ao alterar status no Supabase:', err);
      }
    }

    const novaLista = agendamentos.map(a => {
      if (a.id === id && a.status !== 'bloqueio') {
        return { ...a, status: nextStatus };
      }
      return a;
    });
    
    salvarAgendamentosDaData(novaLista);
    
    if (selectedAgendamento && selectedAgendamento.id === id) {
      setSelectedAgendamento(prev => prev ? { 
        ...prev, 
        status: nextStatus 
      } : null);
    }
  };

  // Deletar
  const handleDeleteAgendamento = async (id: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      try {
        await supabase
          .from('agendamentos')
          .update({ status: 'cancelado' })
          .eq('id', id);
      } catch (err) {
        console.error('[HoraHub] Erro ao cancelar agendamento no Supabase:', err);
      }
    }

    const novaLista = agendamentos.filter(a => a.id !== id);
    salvarAgendamentosDaData(novaLista);
    setSelectedAgendamento(null);
  };

  return (
    <div className="dashboard-container">
      {/* HEADER PRINCIPAL */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="app-title-group">
            <span className="badge-live">Live</span>
            <h1>Encaixe</h1>
          </div>
          <p className="header-subtitle">Painel de Recepção & Gestão do Dia</p>
        </div>

        {/* Data e Navegação */}
        <div className="date-navigator">
          <button className="nav-btn" onClick={handlePrevDay} title="Dia anterior">
            <ChevronLeft size={18} />
          </button>
          <div className="date-display">
            <CalendarIcon size={16} />
            <span>{formatarData(currentDate)}</span>
          </div>
          <button className="nav-btn" onClick={handleNextDay} title="Próximo dia">
            <ChevronRight size={18} />
          </button>
        </div>

        <button className="btn-pill" onClick={() => setShowNewModal(true)}>
          <Plus size={16} />
          <span>Novo Agendamento</span>
        </button>
      </header>

      {/* CARDS DE ESTATÍSTICAS */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon-wrapper confirmed">
            <Check size={18} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Confirmados</span>
            <span className="stat-value">{totalConfirmados}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper pending">
            <AlertCircle size={18} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Pendentes</span>
            <span className="stat-value">{totalPendentes}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper revenue">
            <TrendingUp size={18} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Faturamento Estimado</span>
            <span className="stat-value">R$ {faturamentoEstimado.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* GRADE DO CALENDÁRIO */}
      <div className="calendar-outer-container">
        <div className="calendar-grid-wrapper">
          {/* Header do Grid (Coluna dos Profissionais) */}
          <div className="calendar-header-row">
            <div className="time-column-header">
              <Clock size={14} />
            </div>
            <div className="professionals-headers">
              {funcionarios.map(func => (
                <div key={func.id} className="prof-header-cell">
                  <div className="avatar-placeholder">
                    {func.foto_url ? (
                      <img 
                        src={func.foto_url} 
                        alt={func.nome} 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      func.nome.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div className="prof-info">
                    <h3>{func.nome}</h3>
                    <span>{func.especialidade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Linhas e Colunas do Calendário */}
          <div className="calendar-body-row">
            {/* Eixo Y: Coluna de Horários */}
            <div className="time-column">
              {timeSlots.map(time => (
                <div key={time} className="time-cell" style={{ height: `${ROW_HEIGHT}px` }}>
                  <span>{time}</span>
                </div>
              ))}
            </div>

            {/* Eixo X: Colunas dos Profissionais com os Agendamentos */}
            <div className="calendar-columns-container">
              {/* Linhas horizontais de fundo do Grid */}
              <div className="grid-lines-background">
                {timeSlots.map((time, idx) => (
                  <div 
                    key={`line-${time}`} 
                    className={`grid-horizontal-line ${idx % 2 === 0 ? 'hour-line' : 'half-hour-line'}`}
                    style={{ height: `${ROW_HEIGHT}px` }}
                  />
                ))}
              </div>

              {/* Colunas Reais dos Profissionais contendo os cartões absolutos */}
              <div className="columns-grid">
                {funcionarios.map(func => {
                  // Filtrar agendamentos desse funcionário
                  const funcAgendamentos = agendamentos.filter(a => a.funcionarioId === func.id);

                  return (
                    <div key={`col-${func.id}`} className="prof-column-body">
                      {funcAgendamentos.map(agenda => {
                        const { top, height } = calculatePosition(agenda.horarioInicio, agenda.horarioFim);
                        
                        return (
                          <div
                            key={agenda.id}
                            className={`appointment-card ${agenda.status}`}
                            style={{ 
                              top: `${top}px`, 
                              height: `${height}px`,
                            }}
                            onClick={() => setSelectedAgendamento(agenda)}
                          >
                            <div className="card-indicator"></div>
                            <div className="appointment-card-content">
                              <div className="appointment-header">
                                <span className="appointment-time">{agenda.horarioInicio} - {agenda.horarioFim}</span>
                              </div>
                              <h4 className="client-name">{agenda.clienteNome}</h4>
                              <p className="service-name">{agenda.servicoNome}</p>
                              {agenda.preco && <span className="price-tag">R$ {Number(agenda.preco).toFixed(2)}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DETALHES DO AGENDAMENTO */}
      {selectedAgendamento && (
        <div className="side-panel-overlay" onClick={() => setSelectedAgendamento(null)}>
          <div className="side-panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <h2>Detalhes do Agendamento</h2>
              <button className="btn-close" onClick={() => setSelectedAgendamento(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="panel-body">
              {selectedAgendamento.status === 'bloqueio' ? (
                <div className="block-details">
                  <div className="block-icon">
                    <Coffee size={36} />
                  </div>
                  <h3>Intervalo / Bloqueio</h3>
                  <div className="detail-item">
                    <Clock size={16} />
                    <div>
                      <span>Horário</span>
                      <strong>{selectedAgendamento.horarioInicio} às {selectedAgendamento.horarioFim}</strong>
                    </div>
                  </div>
                  <button 
                    className="btn-delete-appointment" 
                    onClick={() => handleDeleteAgendamento(selectedAgendamento.id)}
                  >
                    Remover Bloqueio
                  </button>
                </div>
              ) : (
                <div className="appointment-details">
                  <div className="detail-header-info">
                    <div className="avatar-large">
                      {selectedAgendamento.clienteNome[0]}
                    </div>
                    <h3>{selectedAgendamento.clienteNome}</h3>
                    <span className={`status-badge ${selectedAgendamento.status}`}>
                      {selectedAgendamento.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </div>

                  <div className="details-list">
                    <div className="detail-item">
                      <Clock size={16} />
                      <div>
                        <span>Horário</span>
                        <strong>{selectedAgendamento.horarioInicio} às {selectedAgendamento.horarioFim}</strong>
                      </div>
                    </div>

                    <div className="detail-item">
                      <User size={16} />
                      <div>
                        <span>Profissional</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          {(() => {
                            const func = funcionarios.find(f => f.id === selectedAgendamento.funcionarioId);
                            return (
                              <>
                                {func?.foto_url ? (
                                  <img 
                                    src={func.foto_url} 
                                    alt={func.nome} 
                                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                                  />
                                ) : (
                                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                    {func?.nome.split(' ').map(n => n[0]).join('')}
                                  </div>
                                )}
                                <strong style={{ marginTop: 0 }}>{func?.nome}</strong>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <TrendingUp size={16} />
                      <div>
                        <span>Serviço</span>
                        <strong>{selectedAgendamento.servicoNome}</strong>
                      </div>
                    </div>

                    {selectedAgendamento.preco && (
                      <div className="detail-item">
                        <DollarSign size={16} />
                        <div>
                          <span>Preço</span>
                          <strong>R$ {selectedAgendamento.preco.toFixed(2)}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="panel-actions">
                    <button 
                      className={`btn-action-status ${selectedAgendamento.status}`}
                      onClick={() => handleToggleStatus(selectedAgendamento.id)}
                    >
                      {selectedAgendamento.status === 'confirmado' ? 'Marcar como Pendente' : 'Confirmar Agendamento'}
                    </button>
                    
                    <button 
                      className="btn-delete-appointment"
                      onClick={() => handleDeleteAgendamento(selectedAgendamento.id)}
                    >
                      Cancelar Agendamento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO AGENDAMENTO */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => { setConflictError(null); setShowNewModal(false); }}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Agendamento</h2>
              <button className="btn-close" onClick={() => { setConflictError(null); setShowNewModal(false); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAgendamento} className="modal-form">
              <div className="form-group">
                <label>Cliente</label>
                <input 
                  type="text" 
                  placeholder="Nome do cliente" 
                  value={newClient} 
                  onChange={e => setNewClient(e.target.value)} 
                  required 
                />
              </div>

              {/* PROFISSIONAL ISOLADO (LARGURA INTEIRA) */}
              <div className="form-group">
                <label>Profissional</label>
                <select 
                  value={newFuncionario} 
                  onChange={e => handleFuncionarioChange(e.target.value)}
                >
                  {funcionarios.map(func => (
                    <option key={func.id} value={func.id}>{func.nome}</option>
                  ))}
                </select>
              </div>

              {/* PREÇO SUGERIDO | SERVIÇO HABILITADO */}
              <div className="form-row">
                <div className="form-group">
                  <label>Preço sugerido</label>
                  <div className="price-input-wrapper">
                    <span className="price-symbol">R$</span>
                    <input 
                      type="text" 
                      value={newPrice} 
                      onChange={e => setNewPrice(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Serviço Habilitado</label>
                  <select 
                    value={newServiceId} 
                    onChange={e => handleServicoChange(e.target.value)}
                    required
                  >
                    {getServicosDoProfissional(newFuncionario).map(serv => (
                      <option key={serv.id} value={serv.id}>{serv.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* INÍCIO | FIM (LADO A LADO DO MESMO TAMANHO) */}
              <div className="form-row">
                <div className="form-group">
                  <label>Horário de Início</label>
                  <input 
                    type="time" 
                    value={newTimeStart} 
                    onChange={e => handleTimeStartChange(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Fim (estimado automaticamente)</label>
                  <input 
                    type="time" 
                    value={newTimeEnd} 
                    onChange={e => { setNewTimeEnd(e.target.value); setConflictError(null); }} 
                    required 
                  />
                </div>
              </div>

              {conflictError && (
                <div className="conflict-error-banner">
                  <AlertCircle size={16} />
                  <span>{conflictError}</span>
                </div>
              )}

              <button type="submit" className="btn-submit">
                Salvar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}
      {/* FAIXA DE RESUMO FLUTUANTE NO RODAPÉ */}
      <div className="calendar-footer-summary">
        <div className="footer-summary-container">
          <div className="footer-summary-title">Resumo do Dia</div>
          <div className="footer-summary-items">
            <div className="footer-summary-item confirmed">
              <span className="summary-dot"></span>
              <span className="summary-label">Confirmados:</span>
              <strong className="summary-value">{totalConfirmados}</strong>
            </div>
            <div className="footer-summary-item pending">
              <span className="summary-dot"></span>
              <span className="summary-label">Pendentes:</span>
              <strong className="summary-value">{totalPendentes}</strong>
            </div>
            <div className="footer-summary-item executed">
              <span className="summary-dot"></span>
              <span className="summary-label">Já Executados:</span>
              <strong className="summary-value">{totalExecutados}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CalendarView;
