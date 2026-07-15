import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import './AgendarPage.css';

interface Servico {
  id: string;
  nome: string;
  duracao_minutos: number;
  preco: number;
}

interface Funcionario {
  id: string;
  nome: string;
  especialidade: string;
  foto_url?: string;
}

interface JornadaDia {
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  almoco_inicio: string;
  almoco_fim: string;
}

interface AgendamentoExistente {
  horario_inicio: string;
  horario_fim: string;
}

export default function AgendarPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // Estados Gerais
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [passo, setPasso] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Dados Carregados do Banco
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  // Seleções do Usuário
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  // Formulário do Cliente
  const [clienteNome, setClienteNome] = useState('');
  const [clienteWhatsapp, setClienteWhatsapp] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [consentimentoLgpd, setConsentimentoLgpd] = useState(false);

  // Slots de Horários Livres Calculados
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<string[]>([]);
  const [calculandoSlots, setCalculandoSlots] = useState(false);

  // 1. Carregar Empresa e Serviços Iniciais
  useEffect(() => {
    async function initPortal() {
      if (!slug) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        // Carrega Empresa
        const { data: emp, error: errEmp } = await supabase
          .from('empresas')
          .select('id, nome, email, cor_primaria, cor_secundaria, logo_url')
          .eq('slug', slug)
          .single();

        if (errEmp || !emp) throw new Error('Empresa não encontrada.');
        setEmpresa(emp);

        // Injetar cores dinamicamente no :root
        if (emp.cor_primaria) {
          document.documentElement.style.setProperty('--booking-accent', emp.cor_primaria);
        }
        if (emp.cor_secundaria) {
          document.documentElement.style.setProperty('--booking-bg', emp.cor_secundaria);
        }

        // Carrega Serviços
        const { data: servs, error: errServs } = await supabase
          .from('servicos')
          .select('id, nome, duracao_minutos, preco')
          .eq('tenant_id', emp.id)
          .order('nome', { ascending: true });

        if (errServs) throw errServs;
        setServicos(servs || []);
      } catch (err: any) {
        console.error('[HoraHub] Erro na inicialização do portal:', err);
        setErrorMsg('Não foi possível carregar a página de agendamentos.');
      } finally {
        setLoading(false);
      }
    }
    initPortal();
  }, [slug]);

  // 2. Carregar Colaboradores aptos ao Serviço selecionado (Passo 2)
  useEffect(() => {
    if (!servicoSelecionado || !empresa) return;

    async function loadFuncionariosAptos() {
      try {
        // Busca profissionais vinculados ao serviço selecionado na tabela pivot
        const { data: pivotData, error: errPivot } = await supabase
          .from('funcionario_servicos')
          .select('funcionario_id')
          .eq('servico_id', servicoSelecionado!.id);

        if (errPivot) throw errPivot;

        const idsAptos = pivotData?.map(p => p.funcionario_id) || [];

        if (idsAptos.length === 0) {
          // Se não houver vínculos, busca todos como fallback
          const { data: funcs, error: errFuncs } = await supabase
            .from('funcionarios')
            .select('id, nome, especialidade, foto_url')
            .eq('tenant_id', empresa.id);
          if (errFuncs) throw errFuncs;
          setFuncionarios(funcs || []);
        } else {
          // Busca os profissionais específicos
          const { data: funcs, error: errFuncs } = await supabase
            .from('funcionarios')
            .select('id, nome, especialidade, foto_url')
            .in('id', idsAptos);
          if (errFuncs) throw errFuncs;
          setFuncionarios(funcs || []);
        }
      } catch (err: any) {
        console.error('[HoraHub] Erro ao carregar equipe:', err);
      }
    }
    loadFuncionariosAptos();
  }, [servicoSelecionado, empresa]);

  // 3. Carregar Jornadas e Agendamentos Existentes para calcular Horários Livres (Passo 3)
  useEffect(() => {
    if (!funcionarioSelecionado || !dataSelecionada || !empresa) return;

    async function fetchDisponibilidade() {
      setCalculandoSlots(true);
      setHorarioSelecionado(null);
      setSlotsDisponiveis([]);
      
      const diaSemana = dataSelecionada.getDay(); // 0: Domingo, 1: Segunda...
      const dataStr = dataSelecionada.toISOString().split('T')[0]; // "YYYY-MM-DD"

      try {
        // Busca Jornada de Trabalho do Profissional
        const { data: jorn, error: errJorn } = await supabase
          .from('jornadas_trabalho')
          .select('dia_semana, hora_inicio, hora_fim, almoco_inicio, almoco_fim')
          .eq('funcionario_id', funcionarioSelecionado!.id)
          .eq('dia_semana', diaSemana)
          .single();

        // Se der erro ou a jornada não existir, assume que não trabalha hoje
        if (errJorn || !jorn) {
          setSlotsDisponiveis([]);
          setCalculandoSlots(false);
          return;
        }

        // Busca agendamentos do dia do profissional selecionado
        const inicioDia = `${dataStr}T00:00:00Z`;
        const fimDia = `${dataStr}T23:59:59Z`;

        const { data: agends, error: errAgends } = await supabase
          .from('agendamentos')
          .select('horario_inicio, horario_fim')
          .eq('funcionario_id', funcionarioSelecionado!.id)
          .neq('status', 'cancelado')
          .gte('horario_inicio', inicioDia)
          .lte('horario_inicio', fimDia);

        if (errAgends) throw errAgends;

        calculateTimeSlots(jorn, agends || []);
      } catch (err) {
        console.error('[HoraHub] Erro ao buscar horários:', err);
      } finally {
        setCalculandoSlots(false);
      }
    }

    fetchDisponibilidade();
  }, [funcionarioSelecionado, dataSelecionada, empresa]);

  // Algoritmo de Geração de Slots de Horários Livres
  const calculateTimeSlots = (jornada: JornadaDia, ocupados: AgendamentoExistente[]) => {
    const slots: string[] = [];
    const duracao = servicoSelecionado?.duracao_minutos || 30;

    // Converter TIME strings para minutos totais desde 00:00
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const minExpediente = toMinutes(jornada.hora_inicio);
    const maxExpediente = toMinutes(jornada.hora_fim);
    const minAlmoco = jornada.almoco_inicio ? toMinutes(jornada.almoco_inicio) : null;
    const maxAlmoco = jornada.almoco_fim ? toMinutes(jornada.almoco_fim) : null;

    // Converter agendamentos ocupados em intevalos de minutos do dia
    const slotsOcupados = ocupados.map(o => {
      const dInicio = new Date(o.horario_inicio);
      const dFim = new Date(o.horario_fim);
      
      const minInicio = dInicio.getUTCHours() * 60 + dInicio.getUTCMinutes();
      const minFim = dFim.getUTCHours() * 60 + dFim.getUTCMinutes();
      return { inicio: minInicio, fim: minFim };
    });

    // Gerar slots a cada 30 minutos
    for (let min = minExpediente; min + duracao <= maxExpediente; min += 30) {
      const slotInicio = min;
      const slotFim = min + duracao;

      // 1. Verificar conflito com horário de almoço
      if (minAlmoco && maxAlmoco) {
        // Se o slot sobrepõe de qualquer forma o almoço
        if (slotInicio < maxAlmoco && slotFim > minAlmoco) {
          continue; 
        }
      }

      // 2. Verificar conflito com agendamentos ocupados
      let conflito = false;
      for (const ocup of slotsOcupados) {
        if (slotInicio < ocup.fim && slotFim > ocup.inicio) {
          conflito = true;
          break;
        }
      }

      if (!conflito) {
        // Converter minutos totais de volta para "HH:MM"
        const h = String(Math.floor(min / 60)).padStart(2, '0');
        const m = String(min % 60).padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }

    setSlotsDisponiveis(slots);
  };

  // 4. Concluir Agendamento no Banco (Passo 4)
  const finalizarAgendamento = async () => {
    if (!servicoSelecionado || !funcionarioSelecionado || !dataSelecionada || !horarioSelecionado || !consentimentoLgpd) {
      setErrorMsg('Por favor, preencha todos os campos e aceite os termos da LGPD.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const [h, m] = horarioSelecionado.split(':').map(Number);
    
    // Gerar DateTimes corretos em UTC para gravação
    const dataInicio = new Date(Date.UTC(
      dataSelecionada.getFullYear(), 
      dataSelecionada.getMonth(), 
      dataSelecionada.getDate(), 
      h, 
      m
    ));

    const dataFim = new Date(dataInicio.getTime() + (servicoSelecionado!.duracao_minutos * 60 * 1000));

    try {
      const { error } = await supabase
        .from('agendamentos')
        .insert({
          tenant_id: empresa.id,
          funcionario_id: funcionarioSelecionado!.id,
          cliente_name: clienteNome,
          servico_id: servicoSelecionado!.id,
          horario_inicio: dataInicio.toISOString(),
          horario_fim: dataFim.toISOString(),
          status: 'confirmado'
        });

      if (error) throw error;
      setPasso(5); // Sucesso!
    } catch (err: any) {
      console.error('[HoraHub] Erro ao gravar agendamento:', err);
      setErrorMsg(err.message || 'Erro ao realizar agendamento no sistema. Tente outro horário.');
    } finally {
      setLoading(false);
    }
  };

  // Navegação do Calendário (Próximos 7 dias)
  const getProximosDias = () => {
    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      dias.push(d);
    }
    return dias;
  };

  const getNomeDiaSemanaReduzido = (date: Date) => {
    const nomes = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    return nomes[date.getDay()];
  };

  // Aplicar Máscara de Telefone (11) 99999-9999
  const handlePhoneMask = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.substring(0, 2)}) ` + cleaned.substring(2);
    }
    if (cleaned.length > 7) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
    }
    setClienteWhatsapp(formatted);
  };

  if (loading && passo === 1) {
    return <div className="agendar-loading">Carregando portal de agendamento...</div>;
  }

  if (!empresa) {
    return (
      <div className="agendar-not-found">
        <h2>Empresa não encontrada</h2>
        <p>O link acessado é inválido ou a empresa não está ativa.</p>
      </div>
    );
  }

  return (
    <div className="agendar-layout">
      {/* Barra de Progresso Superior */}
      <div className="progress-bar-container">
        <div 
          className="progress-fill" 
          style={{ width: `${(passo / 5) * 100}%` }}
        />
        <div className="steps-indicator">
          <span>Passo {passo} de 5</span>
          <span>{passo === 5 ? 'Concluído!' : 'Agendamento Online'}</span>
        </div>
      </div>

      <div className="portal-container">
        {/* CABEÇALHO */}
        <header className="agendar-header">
          {empresa.logo_url ? (
            <img src={empresa.logo_url} alt={empresa.nome} className="portal-logo-header" />
          ) : (
            <Sparkles className="sparkle-icon" size={24} />
          )}
          <h1>{empresa.nome}</h1>
          <p>Agendamento rápido, seguro e sem filas.</p>
        </header>

        {errorMsg && (
          <div className="agendar-error-banner">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ==================== PASSO 1: SERVIÇOS ==================== */}
        {passo === 1 && (
          <div className="step-pane">
            <h2 className="step-title">Escolha o Serviço</h2>
            <div className="services-list">
              {servicos.map(s => (
                <div 
                  key={s.id} 
                  className={`service-card ${servicoSelecionado?.id === s.id ? 'active' : ''}`}
                  onClick={() => {
                    setServicoSelecionado(s);
                    setPasso(2);
                  }}
                >
                  <div className="service-main">
                    <h3>{s.nome}</h3>
                    <span className="duration-tag">
                      <Clock size={14} />
                      {s.duracao_minutos} min
                    </span>
                  </div>
                  <div className="service-price">
                    R$ {Number(s.preco).toFixed(2).replace('.', ',')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== PASSO 2: PROFISSIONAIS ==================== */}
        {passo === 2 && (
          <div className="step-pane">
            <div className="step-header-row">
              <button className="btn-back" onClick={() => setPasso(1)}>
                <ChevronLeft size={18} /> Voltar
              </button>
              <h2 className="step-title">Escolha o Profissional</h2>
            </div>

            <div className="team-grid-booking">
              {funcionarios.map(f => (
                <div 
                  key={f.id}
                  className={`team-card-booking ${funcionarioSelecionado?.id === f.id ? 'active' : ''}`}
                  onClick={() => {
                    setFuncionarioSelecionado(f);
                    setPasso(3);
                  }}
                >
                  <div className="booking-avatar-container">
                    {f.foto_url ? (
                      <img src={f.foto_url} alt={f.nome} className="booking-avatar" />
                    ) : (
                      <div className="booking-avatar-placeholder">
                        {f.nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3>{f.nome}</h3>
                  <p>{f.especialidade || 'Profissional'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== PASSO 3: DATA & HORA ==================== */}
        {passo === 3 && (
          <div className="step-pane">
            <div className="step-header-row">
              <button className="btn-back" onClick={() => setPasso(2)}>
                <ChevronLeft size={18} /> Voltar
              </button>
              <h2 className="step-title">Escolha Data & Horário</h2>
            </div>

            {/* Carrossel de Datas */}
            <div className="dates-carousel">
              {getProximosDias().map((d, index) => {
                const isSelected = d.toDateString() === dataSelecionada.toDateString();
                return (
                  <button 
                    key={index}
                    type="button"
                    className={`date-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setDataSelecionada(d)}
                  >
                    <span className="day-name">{getNomeDiaSemanaReduzido(d)}</span>
                    <span className="day-number">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {/* Listagem de Horários */}
            <div className="time-slots-container">
              <h3 className="section-subtitle">Horários Disponíveis</h3>
              
              {calculandoSlots ? (
                <div className="loading-slots">Buscando horários disponíveis...</div>
              ) : slotsDisponiveis.length === 0 ? (
                <div className="empty-slots">
                  <CalendarIcon size={32} />
                  <p>Nenhum horário livre encontrado para este dia. Tente outra data.</p>
                </div>
              ) : (
                <div className="slots-grid">
                  {slotsDisponiveis.map(slot => (
                    <button 
                      key={slot}
                      type="button"
                      className={`slot-btn ${horarioSelecionado === slot ? 'active' : ''}`}
                      onClick={() => {
                        setHorarioSelecionado(slot);
                        setPasso(4);
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== PASSO 4: IDENTIFICAÇÃO & LGPD ==================== */}
        {passo === 4 && (
          <div className="step-pane">
            <div className="step-header-row">
              <button className="btn-back" onClick={() => setPasso(3)}>
                <ChevronLeft size={18} /> Voltar
              </button>
              <h2 className="step-title">Complete seus Dados</h2>
            </div>

            {/* Resumo Rápido do Agendamento */}
            <div className="booking-summary-badge">
              <div className="summary-info">
                <span>Serviço:</span>
                <strong>{servicoSelecionado?.nome}</strong>
              </div>
              <div className="summary-info">
                <span>Com:</span>
                <strong>{funcionarioSelecionado?.nome}</strong>
              </div>
              <div className="summary-info">
                <span>Data:</span>
                <strong>
                  {dataSelecionada.getDate()}/{dataSelecionada.getMonth() + 1}/{dataSelecionada.getFullYear()} às {horarioSelecionado}
                </strong>
              </div>
            </div>

            {/* Form de Dados */}
            <form className="booking-form" onSubmit={e => e.preventDefault()}>
              <div className="form-group-booking">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Seu nome completo" 
                  value={clienteNome}
                  onChange={e => setClienteNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-booking">
                <label>WhatsApp</label>
                <div className="input-icon-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="(11) 99999-9999" 
                    value={clienteWhatsapp}
                    onChange={e => handlePhoneMask(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-booking">
                <label>E-mail (Opcional)</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="seuemail@exemplo.com" 
                    value={clienteEmail}
                    onChange={e => setClienteEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Box de Consentimento da LGPD */}
              <div className="lgpd-consent-box">
                <div className="lgpd-shield">
                  <ShieldCheck size={20} className="shield-icon" />
                  <strong>Privacidade & Segurança (LGPD)</strong>
                </div>
                <p>
                  Coletamos seus dados cadastrais apenas para registrar o agendamento, identificar seu atendimento em <strong>{empresa.nome}</strong> e enviar notificações automáticas de confirmação e lembretes via WhatsApp.
                </p>
                <label className="lgpd-checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={consentimentoLgpd}
                    onChange={e => setConsentimentoLgpd(e.target.checked)}
                  />
                  <span className="checkbox-text">
                    Autorizo o tratamento dos meus dados para fins de agendamento e concordo com a política de privacidade.
                  </span>
                </label>
              </div>

              <button 
                type="button" 
                className="btn-confirm-booking"
                disabled={!clienteNome || !clienteWhatsapp || !consentimentoLgpd || loading}
                onClick={finalizarAgendamento}
              >
                {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        )}

        {/* ==================== PASSO 5: SUCESSO ==================== */}
        {passo === 5 && (
          <div className="step-pane success-pane">
            <div className="success-checkmark-circle">
              <Check size={40} className="checkmark-icon" />
            </div>
            
            <h2 className="success-title">Agendado com Sucesso!</h2>
            <p className="success-subtitle">Sua vaga está garantida e confirmada.</p>

            <div className="success-card">
              <h3>Resumo do seu Horário</h3>
              <div className="success-card-row">
                <span>Profissional:</span>
                <strong>{funcionarioSelecionado?.nome}</strong>
              </div>
              <div className="success-card-row">
                <span>Serviço:</span>
                <strong>{servicoSelecionado?.nome}</strong>
              </div>
              <div className="success-card-row">
                <span>Data/Hora:</span>
                <strong>
                  {dataSelecionada.getDate()}/{dataSelecionada.getMonth() + 1}/{dataSelecionada.getFullYear()} às {horarioSelecionado}
                </strong>
              </div>
              <div className="success-card-row">
                <span>Local:</span>
                <strong>{empresa.nome}</strong>
              </div>
            </div>

            <p className="success-tip-text">
              Um aviso de confirmação foi enviado para seu WhatsApp. Nos vemos lá!
            </p>

            <button 
              type="button" 
              className="btn-new-booking"
              onClick={() => {
                setPasso(1);
                setServicoSelecionado(null);
                setFuncionarioSelecionado(null);
                setHorarioSelecionado(null);
                setClienteNome('');
                setClienteWhatsapp('');
                setClienteEmail('');
                setConsentimentoLgpd(false);
              }}
            >
              Realizar Novo Agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
