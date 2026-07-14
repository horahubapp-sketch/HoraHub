import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Sparkles, Check, Scissors } from 'lucide-react';
import { supabase, MOCK_TENANT_ID } from '../services/supabase';
import './EquipePage.css';

interface Funcionario {
  id: string;
  nome: string;
  especialidade: string;
  comissao_percentual: number;
}

interface JornadaDia {
  dia_semana: number;
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
  almoco_inicio: string;
  almoco_fim: string;
}

interface Servico {
  id: string;
  nome: string;
}

const DIAS_SEMANA_NOMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export default function EquipePage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [todosServicos, setTodosServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFunc, setEditingFunc] = useState<Funcionario | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // States do Formulário
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [comissao, setComissao] = useState(0);
  
  // Abas do Modal
  const [activeTab, setActiveTab] = useState<'dados' | 'jornada' | 'servicos'>('dados');

  // Seleção de Serviços do Profissional
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);

  // Configuração da Jornada (inicializado com padrão comercial)
  const [jornada, setJornada] = useState<JornadaDia[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dia_semana: i,
      ativo: i >= 1 && i <= 5, // Ativo de segunda a sexta por padrão
      hora_inicio: '09:00',
      hora_fim: '18:00',
      almoco_inicio: '12:00',
      almoco_fim: '13:00'
    }))
  );

  // Carregar dados iniciais do Supabase
  const loadDados = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Carregar Funcionários
      const { data: funcs, error: errFuncs } = await supabase
        .from('funcionarios')
        .select('id, nome, especialidade, comissao_percentual')
        .eq('tenant_id', MOCK_TENANT_ID)
        .order('nome', { ascending: true });

      if (errFuncs) throw errFuncs;
      setFuncionarios(funcs || []);

      // 2. Carregar todos os Serviços disponíveis do Tenant
      const { data: servs, error: errServs } = await supabase
        .from('servicos')
        .select('id, nome')
        .eq('tenant_id', MOCK_TENANT_ID)
        .order('nome', { ascending: true });

      if (errServs) throw errServs;
      setTodosServicos(servs || []);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setErrorMsg('Não foi possível carregar as informações da equipe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDados();
  }, []);

  // Abrir Modal de Novo Profissional
  const handleNewClick = () => {
    setEditingFunc(null);
    setNome('');
    setEspecialidade('');
    setComissao(0);
    setServicosSelecionados([]);
    setJornada(
      Array.from({ length: 7 }, (_, i) => ({
        dia_semana: i,
        ativo: i >= 1 && i <= 5,
        hora_inicio: '09:00',
        hora_fim: '18:00',
        almoco_inicio: '12:00',
        almoco_fim: '13:00'
      }))
    );
    setActiveTab('dados');
    setErrorMsg(null);
    setShowModal(true);
  };

  // Abrir Modal de Edição (Carrega funcionário, jornada e serviços associados)
  const handleEditClick = async (func: Funcionario) => {
    setEditingFunc(func);
    setNome(func.nome);
    setEspecialidade(func.especialidade || '');
    setComissao(Number(func.comissao_percentual));
    setActiveTab('dados');
    setErrorMsg(null);

    try {
      // 1. Carregar Vínculos de Serviços
      const { data: vs, error: errVs } = await supabase
        .from('funcionario_servicos')
        .select('servico_id')
        .eq('funcionario_id', func.id);

      if (errVs) throw errVs;
      setServicosSelecionados(vs?.map(v => v.servico_id) || []);

      // 2. Carregar Jornadas Cadastradas
      const { data: js, error: errJs } = await supabase
        .from('jornadas_trabalho')
        .select('dia_semana, hora_inicio, hora_fim, almoco_inicio, almoco_fim')
        .eq('funcionario_id', func.id);

      if (errJs) throw errJs;

      // Mesclar jornada cadastrada com a estrutura vazia de 7 dias
      const novaJornada = Array.from({ length: 7 }, (_, i) => {
        const jExist = js?.find(j => j.dia_semana === i);
        if (jExist) {
          return {
            dia_semana: i,
            ativo: true,
            hora_inicio: jExist.hora_inicio.slice(0, 5),
            hora_fim: jExist.hora_fim.slice(0, 5),
            almoco_inicio: jExist.almoco_inicio ? jExist.almoco_inicio.slice(0, 5) : '12:00',
            almoco_fim: jExist.almoco_fim ? jExist.almoco_fim.slice(0, 5) : '13:00'
          };
        }
        return {
          dia_semana: i,
          ativo: false,
          hora_inicio: '09:00',
          hora_fim: '18:00',
          almoco_inicio: '12:00',
          almoco_fim: '13:00'
        };
      });

      setJornada(novaJornada);
      setShowModal(true);
    } catch (err: any) {
      console.error('Erro ao carregar dados do funcionário:', err);
      setErrorMsg('Não foi possível carregar os detalhes do funcionário.');
    }
  };

  // Tratar alteração na checkbox de serviço
  const handleServiceToggle = (servicoId: string) => {
    if (servicosSelecionados.includes(servicoId)) {
      setServicosSelecionados(servicosSelecionados.filter(id => id !== servicoId));
    } else {
      setServicosSelecionados([...servicosSelecionados, servicoId]);
    }
  };

  // Tratar alteração nas configurações de jornada
  const handleJornadaChange = (index: number, campo: keyof JornadaDia, valor: any) => {
    setJornada(jornada.map((j, i) => {
      if (i === index) {
        return { ...j, [campo]: valor };
      }
      return j;
    }));
  };

  // Salvar alterações de forma coordenada (Funcionário + Jornada + Serviços)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nome.trim()) {
      setErrorMsg('O nome do funcionário é obrigatório.');
      return;
    }

    try {
      let funcId = editingFunc?.id;

      if (editingFunc) {
        // 1. Atualizar dados básicos
        const { error: errFunc } = await supabase
          .from('funcionarios')
          .update({
            nome,
            especialidade,
            comissao_percentual: Number(comissao)
          })
          .eq('id', editingFunc.id);

        if (errFunc) throw errFunc;
      } else {
        // 2. Cadastrar novo funcionário
        const { data: newFunc, error: errFunc } = await supabase
          .from('funcionarios')
          .insert({
            tenant_id: MOCK_TENANT_ID,
            nome,
            especialidade,
            comissao_percentual: Number(comissao)
          })
          .select('id')
          .single();

        if (errFunc) throw errFunc;
        funcId = newFunc.id;
      }

      if (!funcId) throw new Error('ID do funcionário não foi localizado.');

      // 3. Atualizar Jornadas de Trabalho (Remover antigas e inserir novas ativas)
      const { error: errDeleteJornadas } = await supabase
        .from('jornadas_trabalho')
        .delete()
        .eq('funcionario_id', funcId);

      if (errDeleteJornadas) throw errDeleteJornadas;

      const jornadasAtivas = jornada.filter(j => j.ativo);
      if (jornadasAtivas.length > 0) {
        const { error: errInsertJornadas } = await supabase
          .from('jornadas_trabalho')
          .insert(
            jornadasAtivas.map(j => ({
              funcionario_id: funcId,
              dia_semana: j.dia_semana,
              hora_inicio: j.hora_inicio,
              hora_fim: j.hora_fim,
              almoco_inicio: j.almoco_inicio || null,
              almoco_fim: j.almoco_fim || null
            }))
          );

        if (errInsertJornadas) throw errInsertJornadas;
      }

      // 4. Atualizar Vínculos de Serviços (Remover antigos e inserir novos selecionados)
      const { error: errDeleteServicos } = await supabase
        .from('funcionario_servicos')
        .delete()
        .eq('funcionario_id', funcId);

      if (errDeleteServicos) throw errDeleteServicos;

      if (servicosSelecionados.length > 0) {
        const { error: errInsertServicos } = await supabase
          .from('funcionario_servicos')
          .insert(
            servicosSelecionados.map(sid => ({
              tenant_id: MOCK_TENANT_ID,
              funcionario_id: funcId,
              servico_id: sid
            }))
          );

        if (errInsertServicos) throw errInsertServicos;
      }

      showSuccess(editingFunc ? 'Profissional atualizado com sucesso!' : 'Profissional criado com sucesso!');
      setShowModal(false);
      loadDados();
    } catch (err: any) {
      console.error('Erro ao salvar profissional:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao salvar o registro.');
    }
  };

  // Excluir Funcionário
  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente remover este profissional? Essa ação excluirá permanentemente seus horários e vínculos.')) {
      return;
    }

    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess('Profissional removido com sucesso!');
      loadDados();
    } catch (err: any) {
      console.error('Erro ao deletar:', err);
      setErrorMsg('Não foi possível excluir o profissional do banco.');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="equipe-container">
      <header className="page-header">
        <div className="header-text">
          <h1>Equipe & Profissionais</h1>
          <p>Gerencie a jornada de trabalho e os serviços que cada colaborador está apto a realizar.</p>
        </div>
        <button className="btn-pill" onClick={handleNewClick}>
          <Plus size={18} />
          <span>Adicionar Profissional</span>
        </button>
      </header>

      {successMsg && (
        <div className="success-toast">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Carregando dados da equipe...</div>
      ) : funcionarios.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={32} />
          <h3>Nenhum profissional cadastrado</h3>
          <p>Clique no botão acima para adicionar o primeiro integrante à sua equipe.</p>
        </div>
      ) : (
        <div className="equipe-grid">
          {funcionarios.map((func) => (
            <div key={func.id} className="equipe-card">
              <div className="card-avatar">
                {func.nome.charAt(0).toUpperCase()}
              </div>
              <div className="card-info">
                <h3>{func.nome}</h3>
                <p className="especialidade-tag">{func.especialidade || 'Geral'}</p>
                <div className="comissao-info">
                  Comissão: <strong>{Number(func.comissao_percentual).toFixed(0)}%</strong>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  className="btn-card-action edit"
                  onClick={() => handleEditClick(func)}
                  title="Editar profissional"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="btn-card-action delete"
                  onClick={() => handleDelete(func.id)}
                  title="Excluir profissional"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CONFIGURAÇÃO COMPLETA */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFunc ? 'Editar Profissional' : 'Novo Profissional'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Abas de Navegação */}
            <div className="modal-tabs">
              <button 
                type="button" 
                className={`tab-btn ${activeTab === 'dados' ? 'active' : ''}`}
                onClick={() => setActiveTab('dados')}
              >
                Dados Básicos
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === 'jornada' ? 'active' : ''}`}
                onClick={() => setActiveTab('jornada')}
              >
                Jornada de Trabalho
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === 'servicos' ? 'active' : ''}`}
                onClick={() => setActiveTab('servicos')}
              >
                Serviços Habilitados
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-scrollable">
              {/* ABA 1: DADOS BÁSICOS */}
              {activeTab === 'dados' && (
                <div className="tab-pane">
                  <div className="form-group">
                    <label>Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Lucas Nogueira" 
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Especialidade / Cargo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Barbeiro Visagista, Designer de Cabelo" 
                      value={especialidade}
                      onChange={e => setEspecialidade(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Percentual de Comissão (%)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={comissao}
                      onChange={e => setComissao(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              )}

              {/* ABA 2: JORNADA DE TRABALHO */}
              {activeTab === 'jornada' && (
                <div className="tab-pane">
                  <div className="jornada-list">
                    {jornada.map((dia, idx) => (
                      <div key={dia.dia_semana} className={`jornada-row ${dia.ativo ? 'active' : 'inactive'}`}>
                        <div className="jornada-day-col">
                          <label className="checkbox-container">
                            <input 
                              type="checkbox" 
                              checked={dia.ativo}
                              onChange={e => handleJornadaChange(idx, 'ativo', e.target.checked)}
                            />
                            <span className="checkbox-label">{DIAS_SEMANA_NOMES[dia.dia_semana]}</span>
                          </label>
                        </div>

                        {dia.ativo ? (
                          <div className="jornada-hours-cols">
                            <div className="hour-field">
                              <span>Entrada</span>
                              <input 
                                type="time" 
                                value={dia.hora_inicio} 
                                onChange={e => handleJornadaChange(idx, 'hora_inicio', e.target.value)}
                              />
                            </div>
                            <div className="hour-field">
                              <span>Almoço Início</span>
                              <input 
                                type="time" 
                                value={dia.almoco_inicio} 
                                onChange={e => handleJornadaChange(idx, 'almoco_inicio', e.target.value)}
                              />
                            </div>
                            <div className="hour-field">
                              <span>Almoço Fim</span>
                              <input 
                                type="time" 
                                value={dia.almoco_fim} 
                                onChange={e => handleJornadaChange(idx, 'almoco_fim', e.target.value)}
                              />
                            </div>
                            <div className="hour-field">
                              <span>Saída</span>
                              <input 
                                type="time" 
                                value={dia.hora_fim} 
                                onChange={e => handleJornadaChange(idx, 'hora_fim', e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="folga-tag">Folga</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 3: SERVIÇOS HABILITADOS */}
              {activeTab === 'servicos' && (
                <div className="tab-pane">
                  <p className="tab-desc">Marque os serviços da lista de preços que este profissional está capacitado a executar:</p>
                  
                  {todosServicos.length === 0 ? (
                    <div className="no-services-warning">
                      <Scissors size={20} />
                      <span>Nenhum serviço cadastrado no catálogo. Adicione serviços na página de Serviços antes.</span>
                    </div>
                  ) : (
                    <div className="services-checkbox-grid">
                      {todosServicos.map(serv => (
                        <label key={serv.id} className="service-checkbox-card">
                          <input 
                            type="checkbox" 
                            checked={servicosSelecionados.includes(serv.id)}
                            onChange={() => handleServiceToggle(serv.id)}
                          />
                          <span className="service-name">{serv.nome}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-actions-sticky">
                {errorMsg && (
                  <div className="modal-error">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button type="submit" className="btn-submit">
                  {editingFunc ? 'Salvar Configurações' : 'Cadastrar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
