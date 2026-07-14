import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Sparkles, Clock, Check } from 'lucide-react';
import { supabase, MOCK_TENANT_ID } from '../services/supabase';
import './ServicosPage.css';

interface Servico {
  id: string;
  nome: string;
  duracao_minutos: number;
  intervalo_preparo_minutos: number;
  preco: number;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // States do Formulário
  const [nome, setNome] = useState('');
  const [duracao, setDuracao] = useState(45);
  const [preparo, setPreparo] = useState(5);
  const [preco, setPreco] = useState(50);

  // Carregar serviços do Supabase
  const loadServicos = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('id, nome, duracao_minutos, intervalo_preparo_minutos, preco')
        .eq('tenant_id', MOCK_TENANT_ID)
        .order('nome', { ascending: true });

      if (error) throw error;
      setServicos(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar serviços:', err);
      setErrorMsg('Não foi possível carregar a lista de serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServicos();
  }, []);

  // Abrir modal para Novo Cadastro
  const handleNewClick = () => {
    setEditingServico(null);
    setNome('');
    setDuracao(45);
    setPreparo(5);
    setPreco(50);
    setErrorMsg(null);
    setShowModal(true);
  };

  // Abrir modal para Edição
  const handleEditClick = (servico: Servico) => {
    setEditingServico(servico);
    setNome(servico.nome);
    setDuracao(servico.duracao_minutos);
    setPreparo(servico.intervalo_preparo_minutos);
    setPreco(servico.preco);
    setErrorMsg(null);
    setShowModal(true);
  };

  // Cadastrar ou Editar no Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nome.trim()) {
      setErrorMsg('O nome do serviço é obrigatório.');
      return;
    }

    try {
      if (editingServico) {
        // Atualizar
        const { error } = await supabase
          .from('servicos')
          .update({
            nome,
            duracao_minutos: Number(duracao),
            intervalo_preparo_minutos: Number(preparo),
            preco: Number(preco)
          })
          .eq('id', editingServico.id);

        if (error) throw error;
        showSuccess('Serviço atualizado com sucesso!');
      } else {
        // Cadastrar
        const { error } = await supabase
          .from('servicos')
          .insert({
            tenant_id: MOCK_TENANT_ID,
            nome,
            duracao_minutos: Number(duracao),
            intervalo_preparo_minutos: Number(preparo),
            preco: Number(preco)
          });

        if (error) throw error;
        showSuccess('Serviço criado com sucesso!');
      }

      setShowModal(false);
      loadServicos();
    } catch (err: any) {
      console.error('Erro ao salvar serviço:', err);
      setErrorMsg(err.message || 'Erro ao salvar serviço.');
    }
  };

  // Excluir serviço
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço? Todos os vínculos com funcionários serão removidos.')) {
      return;
    }

    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess('Serviço removido com sucesso!');
      loadServicos();
    } catch (err: any) {
      console.error('Erro ao deletar serviço:', err);
      setErrorMsg('Não foi possível excluir o serviço. Verifique se existem agendamentos ativos vinculados.');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="servicos-container">
      <header className="page-header">
        <div className="header-text">
          <h1>Serviços & Preços</h1>
          <p>Gerencie o catálogo de serviços, tempo de duração e intervalos de preparo.</p>
        </div>
        <button className="btn-pill" onClick={handleNewClick}>
          <Plus size={18} />
          <span>Novo Serviço</span>
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
        <div className="loading-state">Carregando catálogo de serviços...</div>
      ) : servicos.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={32} />
          <h3>Nenhum serviço cadastrado</h3>
          <p>Clique no botão acima para adicionar o primeiro serviço à tabela de preços.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="servicos-table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Duração</th>
                <th>Preparo/Limpeza</th>
                <th>Preço</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico) => (
                <tr key={servico.id} className="table-row">
                  <td className="font-semibold">{servico.nome}</td>
                  <td>
                    <div className="cell-with-icon">
                      <Clock size={14} />
                      <span>{servico.duracao_minutos} min</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon text-muted">
                      <span>+ {servico.intervalo_preparo_minutos} min</span>
                    </div>
                  </td>
                  <td className="font-bold price-cell">
                    R$ {Number(servico.preco).toFixed(2)}
                  </td>
                  <td className="text-right actions-cell">
                    <button 
                      className="btn-action edit" 
                      onClick={() => handleEditClick(servico)}
                      title="Editar serviço"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="btn-action delete" 
                      onClick={() => handleDelete(servico.id)}
                      title="Excluir serviço"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CADASTRAR/EDITAR */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingServico ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nome do Serviço</label>
                <input 
                  type="text" 
                  placeholder="Ex: Corte Degradê, Barba Terapia, Hidratação" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duração (minutos)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={duracao}
                    onChange={e => setDuracao(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preparo/Limpeza (minutos)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={preparo}
                    onChange={e => setPreparo(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Preço Sugerido (R$)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={preco}
                  onChange={e => setPreco(Number(e.target.value))}
                  required
                />
              </div>

              {errorMsg && (
                <div className="modal-error">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button type="submit" className="btn-submit">
                {editingServico ? 'Salvar Alterações' : 'Cadastrar Serviço'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
