import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Sparkles, Check, Scissors } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import './EquipePage.css';

interface Funcionario {
  id: string;
  nome: string;
  especialidade: string;
  comissao_percentual: number;
  foto_url?: string;
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

const LOCAL_STORAGE_KEY_FUNCS = 'horahub_funcionarios_demo';
const LOCAL_STORAGE_KEY_SERVS = 'horahub_servicos_demo';

const isUUID = (str: string): boolean => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

export default function EquipePage() {
  const { tenantId } = useAuth();

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
  const [fotoUrl, setFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Abas do Modal
  const [activeTab, setActiveTab] = useState<'dados' | 'jornada' | 'servicos'>('dados');

  // Seleção de Serviços do Profissional
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);

  // Configuração da Jornada
  const [jornada, setJornada] = useState<JornadaDia[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dia_semana: i,
      ativo: i >= 1 && i <= 5,
      hora_inicio: '09:00',
      hora_fim: '18:00',
      almoco_inicio: '12:00',
      almoco_fim: '13:00'
    }))
  );

  // Carregar dados (Supabase com fallback de LocalStorage)
  const loadDados = async () => {
    if (!tenantId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Carregar Funcionários
      const { data: funcs, error: errFuncs } = await supabase
        .from('funcionarios')
        .select('id, nome, especialidade, comissao_percentual, foto_url')
        .eq('tenant_id', tenantId)
        .order('nome', { ascending: true });

      if (errFuncs) throw errFuncs;
      setFuncionarios(funcs || []);
      if (funcs) {
        localStorage.setItem(LOCAL_STORAGE_KEY_FUNCS, JSON.stringify(funcs));
      }

      // 2. Carregar todos os Serviços
      const { data: servs, error: errServs } = await supabase
        .from('servicos')
        .select('id, nome')
        .eq('tenant_id', tenantId)
        .order('nome', { ascending: true });

      if (errServs) throw errServs;
      setTodosServicos(servs || []);
    } catch (err: any) {
      console.warn('[HoraHub] Erro ao carregar dados da equipe. Usando LocalStorage.');
      
      // Carregar do LocalStorage
      const localFuncs = localStorage.getItem(LOCAL_STORAGE_KEY_FUNCS);
      const localServs = localStorage.getItem(LOCAL_STORAGE_KEY_SERVS);

      if (localFuncs) {
        setFuncionarios(JSON.parse(localFuncs));
      } else {
        const funcsMock = [
          { id: 'f-mock-1', nome: 'Bruno Silva', especialidade: 'Cabelo & Barba Sênior', comissao_percentual: 50, foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' },
          { id: 'f-mock-2', nome: 'Lucas Nogueira', especialidade: 'Corte Moderno & Tintura', comissao_percentual: 40, foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150' },
          { id: 'f-mock-3', nome: 'Ana Costa', especialidade: 'Barba Clássica & Visagismo', comissao_percentual: 45, foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
          { id: 'f-mock-4', nome: 'Mateus Santos', especialidade: 'Cortes Clássicos & Infantil', comissao_percentual: 50, foto_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150&h=150' }
        ];
        setFuncionarios(funcsMock);
        localStorage.setItem(LOCAL_STORAGE_KEY_FUNCS, JSON.stringify(funcsMock));
      }

      if (localServs) {
        setTodosServicos(JSON.parse(localServs));
      } else {
        setTodosServicos([
          { id: 's-mock-1', nome: 'Corte Degradê' },
          { id: 's-mock-2', nome: 'Barboterapia' },
          { id: 's-mock-3', nome: 'Corte Degradê + Barba' }
        ]);
      }

      if (!err.message?.includes('API key') && !err.message?.includes('JWT')) {
        setErrorMsg('Conexão instável. Operando equipe em modo offline.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDados();
  }, [tenantId]);

  // Abrir Modal de Novo Profissional
  const handleNewClick = () => {
    setEditingFunc(null);
    setNome('');
    setEspecialidade('');
    setComissao(0);
    setFotoUrl('');
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
    setFotoUrl(func.foto_url || '');
    setActiveTab('dados');
    setErrorMsg(null);

    const jornadaPadrao = Array.from({ length: 7 }, (_, i) => ({
      dia_semana: i,
      ativo: i >= 1 && i <= 5,
      hora_inicio: '09:00',
      hora_fim: '18:00',
      almoco_inicio: '12:00',
      almoco_fim: '13:00'
    }));

    try {
      // Se for mock/demo, não busca no Supabase
      if (func.id.startsWith('f-mock')) {
        const funcSalvo = funcionarios.find(f => f.id === func.id) as any;
        setServicosSelecionados(funcSalvo?.servicos_ids || ['s-mock-1', 's-mock-2']);
        setJornada(funcSalvo?.jornada || jornadaPadrao);
        setShowModal(true);
        return;
      }

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
      console.warn('[HoraHub] Erro de rede ao buscar detalhes. Abrindo no modo offline/demo.');
      setServicosSelecionados([]);
      setJornada(jornadaPadrao);
      setShowModal(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    // Limitar em 2MB para evitar travar localStorage em Base64 fallback
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('A imagem deve ter no máximo 2MB.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    // 1. Fallback / Modo Demo instantâneo usando FileReader (Base64)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setFotoUrl(base64data);
    };
    reader.readAsDataURL(file);

    // 2. Tenta fazer o upload para o Supabase Storage se conectado
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${tenantId || 'global'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.warn('[HoraHub] Falha no storage do Supabase local. Mantendo Base64 offline:', uploadError.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFotoUrl(publicUrl);
      showSuccess('Foto enviada e vinculada com sucesso no banco local!');
    } catch (err: any) {
      console.warn('[HoraHub] Erro de rede no upload do arquivo. Usando fallback offline.');
    } finally {
      setUploading(false);
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

  // Salvar alterações
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
        // Se o ID não for um UUID válido (for um mock como 'f2'), salva diretamente local
        if (!isUUID(editingFunc.id)) {
          const novaLista = funcionarios.map(f => f.id === editingFunc.id ? {
            ...f,
            nome,
            especialidade,
            comissao_percentual: Number(comissao),
            servicos_ids: servicosSelecionados,
            jornada: jornada,
            foto_url: fotoUrl
          } : f);
          setFuncionarios(novaLista);
          localStorage.setItem(LOCAL_STORAGE_KEY_FUNCS, JSON.stringify(novaLista));
          showSuccess('Modo Demo: Profissional atualizado localmente!');
          setShowModal(false);
          return;
        }

        // 1. Atualizar dados básicos no Supabase (para UUIDs reais)
        const { error: errFunc } = await supabase
          .from('funcionarios')
          .update({
            nome,
            especialidade,
            comissao_percentual: Number(comissao),
            foto_url: fotoUrl
          })
          .eq('id', editingFunc.id);

        if (errFunc) {
          // Fallback para rede/API Key inválida
          if (errFunc.message.includes('API key') || errFunc.message.includes('JWT') || errFunc.message.includes('fetch')) {
            const novaLista = funcionarios.map(f => f.id === editingFunc.id ? {
              ...f,
              nome,
              especialidade,
              comissao_percentual: Number(comissao),
              servicos_ids: servicosSelecionados,
              jornada: jornada,
              foto_url: fotoUrl
            } : f);
            setFuncionarios(novaLista);
            localStorage.setItem(LOCAL_STORAGE_KEY_FUNCS, JSON.stringify(novaLista));
            showSuccess('Modo Demo: Profissional atualizado localmente!');
            setShowModal(false);
            return;
          }
          throw errFunc;
        }
      } else {
        // 2. Cadastrar novo funcionário no Supabase
        const { data: newFunc, error: errFunc } = await supabase
          .from('funcionarios')
          .insert({
            tenant_id: tenantId,
            nome,
            especialidade,
            comissao_percentual: Number(comissao),
            foto_url: fotoUrl
          })
          .select('id')
          .single();

        if (errFunc) {
          // Fallback para rede/API Key inválida
          if (errFunc.message.includes('API key') || errFunc.message.includes('JWT') || errFunc.message.includes('fetch')) {
            const novo = {
              id: `f-mock-${Date.now()}`,
              nome,
              especialidade,
              comissao_percentual: Number(comissao),
              servicos_ids: servicosSelecionados,
              jornada: jornada,
              foto_url: fotoUrl
            };
            const novaLista = [...funcionarios, novo];
            setFuncionarios(novaLista);
            localStorage.setItem(LOCAL_STORAGE_KEY_FUNCS, JSON.stringify(novaLista));
            showSuccess('Modo Demo: Profissional criado localmente!');
            setShowModal(false);
            return;
          }
          throw errFunc;
        }
        funcId = newFunc.id;
      }

      if (!funcId) throw new Error('ID do funcionário não foi localizado.');

      // 3. Atualizar Jornadas de Trabalho (Supabase)
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

      // 4. Atualizar Vínculos de Serviços (Supabase)
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
              tenant_id: tenantId,
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
      // Se for um ID mockado (não-UUID), deleta diretamente local
      if (!isUUID(id)) {
        const novaLista = funcionarios.filter(f => f.id !== id);
        setFuncionarios(novaLista);
        localStorage.setItem(LOCAL_STORAGE_KEY_FUNCS, JSON.stringify(novaLista));
        showSuccess('Modo Demo: Profissional removido localmente!');
        return;
      }

      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id);

      if (error) {
        // Fallback para rede/API Key inválida
        if (error.message.includes('API key') || error.message.includes('JWT') || error.message.includes('fetch')) {
          const novaLista = funcionarios.filter(f => f.id !== id);
          setFuncionarios(novaLista);
          localStorage.setItem(LOCAL_STORAGE_KEY_FUNCS, JSON.stringify(novaLista));
          showSuccess('Modo Demo: Profissional removido localmente!');
          return;
        }
        throw error;
      }
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
                {func.foto_url ? (
                  <img 
                    src={func.foto_url} 
                    alt={func.nome} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  func.nome.charAt(0).toUpperCase()
                )}
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

                  <div className="form-group">
                    <label>Foto do Colaborador</label>
                    <div className="avatar-upload-block">
                      <div className="avatar-preview-box">
                        {fotoUrl ? (
                          <img src={fotoUrl} alt="Preview" />
                        ) : (
                          nome ? nome.charAt(0).toUpperCase() : '?'
                        )}
                      </div>
                      
                      <div className="avatar-upload-inputs">
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="file-upload" 
                          style={{ display: 'none' }} 
                          onChange={handleFileChange} 
                        />
                        <label htmlFor="file-upload" className="btn-upload-avatar">
                          {uploading ? 'Carregando...' : 'Selecionar do Dispositivo'}
                        </label>
                        <span className="upload-tip">
                          JPG, PNG (Recomendado: 1:1, máx. 2MB)
                        </span>
                      </div>
                    </div>
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
