import { useState } from 'react';
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
import { FUNCIONARIOS_MOCK, AGENDAMENTOS_MOCK } from '../mockData';
import type { Funcionario, Agendamento } from '../mockData';
import './CalendarView.css';

const START_HOUR = 8;
const END_HOUR = 20;
const ROW_HEIGHT = 65; // px para cada intervalo de 30 minutos

export const CalendarView = () => {
  const [funcionarios] = useState<Funcionario[]>(FUNCIONARIOS_MOCK);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(AGENDAMENTOS_MOCK);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  
  // State do Form do Novo Agendamento
  const [newClient, setNewClient] = useState('');
  const [newService, setNewService] = useState('');
  const [newFuncionario, setNewFuncionario] = useState(funcionarios[0]?.id || '');
  const [newTimeStart, setNewTimeStart] = useState('09:00');
  const [newTimeEnd, setNewTimeEnd] = useState('09:30');
  const [newPrice, setNewPrice] = useState('50');

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
    
    // Calculo do Topo relativo ao início do expediente (8h)
    const top = ((startMins - startDayMinutes) / 30) * ROW_HEIGHT;
    // Calculo da altura
    const height = ((endMins - startMins) / 30) * ROW_HEIGHT;
    
    return { top, height };
  };

  // Estatísticas Rápidas
  const totalConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
  const totalPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const faturamentoEstimado = agendamentos
    .filter(a => a.status !== 'bloqueio')
    .reduce((sum, a) => sum + (a.preco || 0), 0);

  // VALIDAÇÃO DE CONFLITO: Verifica se o novo agendamento sobrepõe algum existente
  // Espelha a lógica da trigger PostgreSQL `verificar_conflito_agendamento`
  // Intervalos semi-abertos [inicio, fim): aInicio < bFim && bInicio < aFim
  const verificarConflito = (funcionarioId: string, inicio: string, fim: string): Agendamento | null => {
    const novoInicio = timeToMinutes(inicio);
    const novoFim = timeToMinutes(fim);

    const agendamentoConflitante = agendamentos.find(a => {
      if (a.funcionarioId !== funcionarioId) return false;
      if (a.status === 'bloqueio') return false; // bloqueios visuais não são agendamentos reais
      const existInicio = timeToMinutes(a.horarioInicio);
      const existFim = timeToMinutes(a.horarioFim);
      // Sobreposição: novoInicio < existFim && existInicio < novoFim
      return novoInicio < existFim && existInicio < novoFim;
    }) || null;

    return agendamentoConflitante;
  };

  // Manipular Adição de Agendamento
  const handleCreateAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newService) return;

    // TRAVA DE DOUBLE-BOOKING: verificar conflito antes de salvar
    const conflito = verificarConflito(newFuncionario, newTimeStart, newTimeEnd);
    if (conflito) {
      const profNome = funcionarios.find(f => f.id === newFuncionario)?.nome || 'este profissional';
      setConflictError(
        `Horário já ocupado! ${profNome} tem "${conflito.clienteNome}" das ${conflito.horarioInicio} às ${conflito.horarioFim}. Escolha outro horário.`
      );
      return;
    }

    const newAgenda: Agendamento = {
      id: `a-${Date.now()}`,
      funcionarioId: newFuncionario,
      clienteNome: newClient,
      servicoNome: newService,
      horarioInicio: newTimeStart,
      horarioFim: newTimeEnd,
      status: 'confirmado',
      preco: Number(newPrice)
    };

    setAgendamentos([...agendamentos, newAgenda]);
    
    // Reset Form
    setNewClient('');
    setNewService('');
    setNewPrice('50');
    setConflictError(null);
    setShowNewModal(false);
  };

  // Alterar Status
  const handleToggleStatus = (id: string) => {
    setAgendamentos(agendamentos.map(a => {
      if (a.id === id && a.status !== 'bloqueio') {
        const nextStatus: 'confirmado' | 'pendente' = a.status === 'confirmado' ? 'pendente' : 'confirmado';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
    
    if (selectedAgendamento && selectedAgendamento.id === id) {
      setSelectedAgendamento(prev => prev ? { 
        ...prev, 
        status: prev.status === 'confirmado' ? 'pendente' : 'confirmado' 
      } : null);
    }
  };

  // Deletar
  const handleDeleteAgendamento = (id: string) => {
    setAgendamentos(agendamentos.filter(a => a.id !== id));
    setSelectedAgendamento(null);
  };

  return (
    <div className="dashboard-container">
      {/* HEADER PRINCIPAL */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="app-title-group">
            <span className="badge-live">Live</span>
            <h1>HoraHub</h1>
          </div>
          <p className="header-subtitle">Painel de Recepção & Gestão do Dia</p>
        </div>

        {/* Data e Navegação */}
        <div className="date-navigator">
          <button className="nav-btn"><ChevronLeft size={18} /></button>
          <div className="date-display">
            <CalendarIcon size={16} />
            <span>Terça-feira, 14 de Julho</span>
          </div>
          <button className="nav-btn"><ChevronRight size={18} /></button>
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
                    {func.nome.split(' ').map(n => n[0]).join('')}
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
                              height: `${height}px` 
                            }}
                            onClick={() => setSelectedAgendamento(agenda)}
                          >
                            <div className="card-indicator" />
                            <div className="appointment-card-content">
                              <div className="appointment-header">
                                <span className="appointment-time">
                                  {agenda.horarioInicio} - {agenda.horarioFim}
                                </span>
                                {agenda.status === 'bloqueio' ? (
                                  <Coffee size={12} className="status-icon" />
                                ) : agenda.status === 'confirmado' ? (
                                  <Check size={12} className="status-icon" />
                                ) : (
                                  <AlertCircle size={12} className="status-icon" />
                                )}
                              </div>
                              <h4 className="client-name">{agenda.clienteNome}</h4>
                              <p className="service-name">{agenda.servicoNome}</p>
                              {agenda.preco && (
                                <span className="price-tag">R$ {agenda.preco.toFixed(2)}</span>
                              )}
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
                        <strong>
                          {funcionarios.find(f => f.id === selectedAgendamento.funcionarioId)?.nome}
                        </strong>
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

              <div className="form-group">
                <label>Serviço</label>
                <input 
                  type="text" 
                  placeholder="Ex: Corte Degradê, Barboterapia" 
                  value={newService} 
                  onChange={e => setNewService(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Profissional</label>
                  <select 
                    value={newFuncionario} 
                    onChange={e => { setNewFuncionario(e.target.value); setConflictError(null); }}
                  >
                    {funcionarios.map(func => (
                      <option key={func.id} value={func.id}>{func.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Preço (R$)</label>
                  <input 
                    type="number" 
                    value={newPrice} 
                    onChange={e => setNewPrice(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Início</label>
                  <input 
                    type="time" 
                    value={newTimeStart} 
                    onChange={e => { setNewTimeStart(e.target.value); setConflictError(null); }} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Fim</label>
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
    </div>
  );
};
export default CalendarView;
