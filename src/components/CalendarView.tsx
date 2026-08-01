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
import { dbAdapter } from '../services/dbAdapter';
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
  
  // Controle Dinâmico de Data (Inicia sempre no dia atual)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedProfId, setSelectedProfId] = useState<string>('all');
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  // Monitorar resolução mobile para desativar filtro 'Todos'
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && selectedProfId === 'all' && funcionarios.length > 0) {
        setSelectedProfId(funcionarios[0].id);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [funcionarios, selectedProfId]);

  // Carregar dados de Funcionários e Serviços do Supabase por tenantId
  useEffect(() => {
    // Limpar cache antigo do localStorage que continha IDs inválidos de mock (como 'f1')
    const localFuncs = localStorage.getItem('encaixe_funcionarios_demo');
    if (localFuncs && localFuncs.includes('"id":"f1"')) {
      localStorage.removeItem('encaixe_funcionarios_demo');
      localStorage.removeItem('encaixe_servicos_demo');
    }

    async function loadProfissionaisEServicos() {
      if (!tenantId) return;

      try {
        const dbFuncs = await dbAdapter.funcionarios.getByTenant(tenantId);
        setFuncionarios(dbFuncs && dbFuncs.length > 0 ? dbFuncs : FUNCIONARIOS_MOCK);

        const dbServs = await dbAdapter.servicos.getByTenant(tenantId);
        if (dbServs && dbServs.length > 0) {
          setCatalogoServicos(dbServs.map((s: any) => ({
            id: s.id,
            nome: s.nome,
            duracao_minutos: s.duracao_minutos || 30,
            preco: Number(s.preco || 0)
          })));
        } else {
          setCatalogoServicos([
            { id: 'c1a3bc08-cb86-4e55-926c-d2c6c06a3eb1', nome: 'Corte Degradê', duracao_minutos: 45, preco: 60.00 },
            { id: 'c2a3bc08-cb86-4e55-926c-d2c6c06a3eb2', nome: 'Barboterapia', duracao_minutos: 30, preco: 40.00 },
            { id: 'c3a3bc08-cb86-4e55-926c-d2c6c06a3eb3', nome: 'Corte Degradê + Barba', duracao_minutos: 60, preco: 90.00 }
          ]);
        }
      } catch (err) {
        console.error('[Encaixe] Erro ao carregar profissionais/serviços:', err);
        setFuncionarios(FUNCIONARIOS_MOCK);
      }
    }

    loadProfissionaisEServicos();
  }, [tenantId]);

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
        const agends = await dbAdapter.agendamentos.getByDate(tenantId, dataKey);
        setAgendamentos(agends || []);
      } catch (err) {
        console.error('[Encaixe] Erro ao carregar agendamentos:', err);
      }
    }

    loadAgendamentos();
  }, [currentDate, funcionarios, tenantId]);



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
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCpfCnpj, setNewClientCpfCnpj] = useState('');
  const [newFuncionario, setNewFuncionario] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newPrice, setNewPrice] = useState('50,00'); // Em R$
  const [newTimeStart, setNewTimeStart] = useState('09:00');
  const [newTimeEnd, setNewTimeEnd] = useState('09:45');

  const handlePhoneMask = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length <= 11) {
      if (cleaned.length > 2) formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
      if (cleaned.length > 7) formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
    } else {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
    }
    setNewClientPhone(formatted);
  };

  const handleClientCpfCnpjMask = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length <= 11) {
      if (cleaned.length > 3) formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3)}`;
      if (cleaned.length > 6) formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6)}`;
      if (cleaned.length > 9) formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}`;
    } else {
      formatted = `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5, 8)}/${cleaned.substring(8, 12)}-${cleaned.substring(12, 14)}`;
    }
    setNewClientCpfCnpj(formatted);
  };

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

  // Estatísticas Rápidas (Refletindo agendamentos do profissional selecionado ou todos)
  const agendamentosFiltrados = selectedProfId === 'all'
    ? agendamentos
    : agendamentos.filter(a => a.funcionarioId === selectedProfId);

  const agendamentosReais = agendamentosFiltrados.filter(a => a.status !== 'bloqueio');
  
  // Total de agendamentos confirmados no dia (independentemente de o horário já ter passado)
  const totalConfirmados = agendamentosReais.filter(a => a.status === 'confirmado').length;
  
  // Total de agendamentos pendentes
  const totalPendentes = agendamentosReais.filter(a => a.status === 'pendente').length;
  
  // Total de agendamentos confirmados cujo horário de término já passou no dia de hoje
  const totalExecutados = agendamentosReais.filter(a => a.status === 'confirmado' && isSlotNoPassado(a.horarioFim, currentDate)).length;
  
  // Faturamento estimado somando todos os agendamentos ativos
  const faturamentoEstimado = agendamentosReais.reduce((sum, a) => sum + (a.preco || 0), 0);

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

    const clienteNameFormatado = newClientCpfCnpj ? `${newClient} (CPF: ${newClientCpfCnpj})` : newClient;

    if (!newFuncionario) {
      setConflictError('Por favor, selecione um profissional.');
      return;
    }

    const dataKey = obterDataKey(currentDate);
    const novoAgendamento: any = {
      funcionarioId: newFuncionario,
      clienteNome: clienteNameFormatado,
      servicoNome: servObj?.nome || 'Serviço',
      horarioInicio: newTimeStart,
      horarioFim: newTimeEnd,
      preco: isNaN(precoTratado) ? (servObj?.preco || 50) : precoTratado,
      status: 'confirmado'
    };

    try {
      await dbAdapter.agendamentos.create(tenantId!, dataKey, novoAgendamento);
      const agendsAtualizados = await dbAdapter.agendamentos.getByDate(tenantId!, dataKey);
      setAgendamentos(agendsAtualizados || []);
      setShowNewModal(false);
      setNewClient('');
      setNewClientPhone('');
      setNewClientCpfCnpj('');
    } catch (err: any) {
      console.error('Erro ao salvar agendamento:', err);
      setConflictError('Não foi possível salvar o agendamento.');
    }
  };

  // Alterar Status
  const handleToggleStatus = async (id: string) => {
    const nextStatus: 'confirmado' | 'pendente' = selectedAgendamento?.status === 'confirmado' ? 'pendente' : 'confirmado';
    const dataKey = obterDataKey(currentDate);

    try {
      await dbAdapter.agendamentos.updateStatus(tenantId!, dataKey, id, nextStatus);
      const agendsAtualizados = await dbAdapter.agendamentos.getByDate(tenantId!, dataKey);
      setAgendamentos(agendsAtualizados || []);

      if (selectedAgendamento && selectedAgendamento.id === id) {
        setSelectedAgendamento(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (err) {
      console.error('[Encaixe] Erro ao alterar status:', err);
    }
  };

  // Deletar Agendamento
  const handleDeleteAgendamento = async (id: string) => {
    const dataKey = obterDataKey(currentDate);
    try {
      await dbAdapter.agendamentos.delete(tenantId!, dataKey, id);
      const agendsAtualizados = await dbAdapter.agendamentos.getByDate(tenantId!, dataKey);
      setAgendamentos(agendsAtualizados || []);
      setSelectedAgendamento(null);
    } catch (err) {
      console.error('[Encaixe] Erro ao excluir agendamento:', err);
    }
  };

  const handleCloseNewModal = () => {
    const isDirty = Boolean(newClient.trim() || newClientCpfCnpj.trim());
    if (isDirty) {
      const confirmar = window.confirm('Você possui informações preenchidas neste agendamento. Deseja realmente sair sem gravar?');
      if (!confirmar) return;
    }
    setNewClient('');
    setNewClientCpfCnpj('');
    setConflictError(null);
    setShowNewModal(false);
  };

  return (
    <div className="calendar-container">
      {/* HEADER DA AGENDA */}
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

      {/* BARRA DE ABAS DE FILTRO POR PROFISSIONAL (MOBILE & DESKTOP) */}
      <div className="prof-filter-tabs-container">
        {!isMobile && (
          <button 
            className={`prof-filter-tab ${selectedProfId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedProfId('all')}
          >
            <span>Todos ({funcionarios.length})</span>
          </button>
        )}
        {funcionarios.map(func => (
          <button 
            key={`tab-${func.id}`}
            className={`prof-filter-tab ${selectedProfId === func.id ? 'active' : ''}`}
            onClick={() => setSelectedProfId(func.id)}
          >
            <div className="tab-avatar-circle">
              {func.foto_url ? (
                <img src={func.foto_url} alt={func.nome} className="tab-avatar-img" />
              ) : (
                <span>{func.nome[0]}</span>
              )}
            </div>
            <span>{func.nome.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* GRADE DO CALENDÁRIO */}
      <div className="calendar-outer-container">
        <div className="calendar-grid-wrapper">
          {/* Header do Grid (Coluna dos Profissionais) */}
          <div className="calendar-header-row">
            <div className="time-column-header">
              <Clock size={14} />
            </div>
            <div className="professionals-headers">
              {(selectedProfId === 'all' ? funcionarios : funcionarios.filter(f => f.id === selectedProfId)).map(func => (
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
                {(selectedProfId === 'all' ? funcionarios : funcionarios.filter(f => f.id === selectedProfId)).map(func => {
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
        <div className="modal-overlay" onClick={handleCloseNewModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Agendamento</h2>
              <button className="btn-close" onClick={handleCloseNewModal}>
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

              <div className="form-group">
                <label>WhatsApp / Telefone para Notificações</label>
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000" 
                  value={newClientPhone} 
                  onChange={e => handlePhoneMask(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>CPF / CNPJ do Cliente (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00 (opcional)" 
                  value={newClientCpfCnpj} 
                  onChange={e => handleClientCpfCnpjMask(e.target.value)} 
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
