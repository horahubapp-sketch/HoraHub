import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Search, 
  Edit2, 
  Check, 
  Ban, 
  RefreshCw, 
  ArrowLeft,
  X,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminPage.css';

interface EmpresaAdmin {
  id: string;
  nome: string;
  email: string | null;
  slug: string | null;
  plano_status: string | null;
  plano_nome: string | null;
  valor_mensalidade: number;
  saldo_devedor: number;
  data_renovacao: string | null;
}

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  
  // Estados de Busca e Filtro
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Estados do Modal de Edição
  const [editingEmp, setEditingEmp] = useState<EmpresaAdmin | null>(null);
  const [planoNome, setPlanoNome] = useState('Bronze');
  const [valorMensalidade, setValorMensalidade] = useState('99.90');
  const [saldoDevedor, setSaldoDevedor] = useState('0.00');
  const [dataRenovacao, setDataRenovacao] = useState('');

  const loadEmpresas = async () => {
    setLoading(true);
    setErroMsg(null);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, email, slug, plano_status, plano_nome, valor_mensalidade, saldo_devedor, data_renovacao')
        .order('nome', { ascending: true });

      if (error) throw error;
      setEmpresas(data || []);
    } catch (err: any) {
      console.error('[HoraHub Superadmin] Erro ao carregar empresas:', err);
      setErroMsg(err.message || 'Falha ao buscar empresas no banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  const handleUpdateStatus = async (id: string, novoStatus: 'ativo' | 'bloqueado' | 'pendente') => {
    setErroMsg(null);
    setSucessoMsg(null);
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ plano_status: novoStatus })
        .eq('id', id);

      if (error) throw error;
      
      setSucessoMsg(`Status da empresa atualizado para '${novoStatus}' com sucesso!`);
      loadEmpresas();
    } catch (err: any) {
      setErroMsg(err.message || 'Erro ao alterar status da empresa.');
    }
  };

  const handleOpenEdit = (emp: EmpresaAdmin) => {
    setEditingEmp(emp);
    setPlanoNome(emp.plano_nome || 'Bronze');
    setValorMensalidade(String(emp.valor_mensalidade || 99.90));
    setSaldoDevedor(String(emp.saldo_devedor || 0.00));
    
    if (emp.data_renovacao) {
      const dataStr = new Date(emp.data_renovacao).toISOString().split('T')[0];
      setDataRenovacao(dataStr);
    } else {
      setDataRenovacao('');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    setErroMsg(null);
    setSucessoMsg(null);

    const valMensal = Number(valorMensalidade.replace(',', '.'));
    const valDebito = Number(saldoDevedor.replace(',', '.'));

    if (isNaN(valMensal) || isNaN(valDebito)) {
      setErroMsg('Por favor, insira valores numéricos válidos para mensalidade e saldo devedor.');
      return;
    }

    try {
      const { error } = await supabase
        .from('empresas')
        .update({
          plano_nome: planoNome,
          valor_mensalidade: valMensal,
          saldo_devedor: valDebito,
          data_renovacao: dataRenovacao ? new Date(dataRenovacao).toISOString() : null
        })
        .eq('id', editingEmp.id);

      if (error) throw error;

      setSucessoMsg('Cobrança e plano da empresa atualizados com sucesso!');
      setEditingEmp(null);
      loadEmpresas();
    } catch (err: any) {
      setErroMsg(err.message || 'Erro ao atualizar plano da empresa.');
    }
  };

  // Filtragem local
  const empresasFiltradas = empresas.filter(emp => {
    const correspondeBusca = emp.nome.toLowerCase().includes(busca.toLowerCase()) || 
      (emp.email && emp.email.toLowerCase().includes(busca.toLowerCase())) ||
      (emp.slug && emp.slug.toLowerCase().includes(busca.toLowerCase()));
    
    if (filtroStatus === 'todos') return correspondeBusca;
    if (filtroStatus === 'devedores') return correspondeBusca && Number(emp.saldo_devedor) > 0;
    return correspondeBusca && emp.plano_status === filtroStatus;
  });

  // Métricas
  const totalClientes = empresas.length;
  const ativos = empresas.filter(e => e.plano_status === 'ativo').length;
  const pendentes = empresas.filter(e => e.plano_status === 'pendente').length;
  const devedores = empresas.filter(e => Number(e.saldo_devedor) > 0).length;
  const mrrEstimado = empresas
    .filter(e => e.plano_status === 'ativo')
    .reduce((acc, curr) => acc + Number(curr.valor_mensalidade || 0), 0);

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatarDataLocal = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="superadmin-wrapper">
      <header className="superadmin-header">
        <button className="btn-back-home" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Voltar ao Painel</span>
        </button>
        <div className="superadmin-title">
          <h1>Super Admin HoraHub</h1>
          <p>Controle de Assinaturas, Faturamento B2B e Ativação de Novas Empresas</p>
        </div>
        <button className="btn-refresh-admin" onClick={loadEmpresas} title="Recarregar dados">
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </header>

      {/* Banners de Feedback */}
      {erroMsg && <div className="superadmin-banner error"><AlertTriangle size={18} /> <span>{erroMsg}</span></div>}
      {sucessoMsg && <div className="superadmin-banner success"><Check size={18} /> <span>{sucessoMsg}</span></div>}

      {/* Cards de Métricas */}
      <section className="superadmin-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box blue">
            <Building2 size={24} />
          </div>
          <div className="metric-details">
            <h3>Total de Empresas</h3>
            <p>{totalClientes}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box green">
            <ShieldCheck size={24} />
          </div>
          <div className="metric-details">
            <h3>Empresas Ativas</h3>
            <p>{ativos}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box yellow">
            <Clock size={24} />
          </div>
          <div className="metric-details">
            <h3>Cadastros Pendentes</h3>
            <p>{pendentes}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box red">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-details">
            <h3>Inadimplentes</h3>
            <p>{devedores}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box emerald">
            <DollarSign size={24} />
          </div>
          <div className="metric-details">
            <h3>MRR Estimado</h3>
            <p>{formatarMoeda(mrrEstimado)}</p>
          </div>
        </div>
      </section>

      {/* Barra de Filtros */}
      <section className="superadmin-filter-bar">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por empresa, email ou slug..." 
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button 
            className={`btn-filter ${filtroStatus === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('todos')}
          >
            Todas
          </button>
          <button 
            className={`btn-filter ${filtroStatus === 'ativo' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('ativo')}
          >
            Ativas
          </button>
          <button 
            className={`btn-filter ${filtroStatus === 'pendente' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('pendente')}
          >
            Pendentes
          </button>
          <button 
            className={`btn-filter ${filtroStatus === 'devedores' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('devedores')}
          >
            Com Débitos
          </button>
          <button 
            className={`btn-filter ${filtroStatus === 'bloqueado' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('bloqueado')}
          >
            Bloqueadas
          </button>
        </div>
      </section>

      {/* Tabela de Empresas */}
      <section className="superadmin-table-wrapper">
        {loading ? (
          <div className="superadmin-loading-box">
            Carregando listagem de estabelecimentos...
          </div>
        ) : empresasFiltradas.length === 0 ? (
          <div className="superadmin-empty-box">
            Nenhuma empresa encontrada com os filtros selecionados.
          </div>
        ) : (
          <table className="superadmin-table">
            <thead>
              <tr>
                <th>Nome da Empresa</th>
                <th>E-mail</th>
                <th>Slug URL</th>
                <th>Plano</th>
                <th>Valor /mês</th>
                <th>Vencimento</th>
                <th>Débito</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {empresasFiltradas.map(emp => {
                const temDebito = Number(emp.saldo_devedor) > 0;
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="empresa-cell-title">
                        <strong>{emp.nome}</strong>
                      </div>
                    </td>
                    <td><span className="email-span">{emp.email || '-'}</span></td>
                    <td><code>/{emp.slug || '-'}</code></td>
                    <td>
                      <span className="badge-plano">
                        {emp.plano_nome || 'Bronze'}
                      </span>
                    </td>
                    <td>{formatarMoeda(emp.valor_mensalidade)}</td>
                    <td>{formatarDataLocal(emp.data_renovacao)}</td>
                    <td>
                      <span className={`debt-label ${temDebito ? 'active' : ''}`}>
                        {formatarMoeda(emp.saldo_devedor)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${emp.plano_status || 'pendente'}`}>
                        {emp.plano_status === 'ativo' ? 'Ativo' : 
                         emp.plano_status === 'bloqueado' ? 'Suspenso' : 'Em Análise'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-flex">
                        {emp.plano_status !== 'ativo' ? (
                          <button 
                            className="btn-action-round accept" 
                            onClick={() => handleUpdateStatus(emp.id, 'ativo')}
                            title="Ativar/Liberar Empresa"
                          >
                            <Check size={14} />
                          </button>
                        ) : (
                          <button 
                            className="btn-action-round block" 
                            onClick={() => handleUpdateStatus(emp.id, 'bloqueado')}
                            title="Bloquear/Suspender Empresa"
                          >
                            <Ban size={14} />
                          </button>
                        )}

                        <button 
                          className="btn-action-round edit" 
                          onClick={() => handleOpenEdit(emp)}
                          title="Configurar Plano e Faturamento"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal de Configuração de Faturamento */}
      {editingEmp && (
        <div className="superadmin-modal-overlay">
          <div className="superadmin-modal-card">
            <header className="modal-card-header">
              <div className="header-icon blue">
                <CreditCard size={20} />
              </div>
              <h2>Gerenciar Faturamento</h2>
              <button className="btn-close-modal" onClick={() => setEditingEmp(null)}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSaveEdit} className="superadmin-modal-form">
              <p className="modal-intro">
                Alterando faturamento e termos de assinatura da empresa: <strong>{editingEmp.nome}</strong>.
              </p>

              <div className="form-field">
                <label>Nome do Plano</label>
                <select value={planoNome} onChange={e => setPlanoNome(e.target.value)}>
                  <option value="Bronze">Bronze (R$ 99,90/mês)</option>
                  <option value="Prata">Prata (R$ 149,90/mês)</option>
                  <option value="Ouro">Ouro (R$ 249,90/mês)</option>
                  <option value="Customizado">Customizado (Valor customizado)</option>
                </select>
              </div>

              <div className="form-field">
                <label>Valor Mensalidade (R$)</label>
                <input 
                  type="text" 
                  value={valorMensalidade}
                  onChange={e => setValorMensalidade(e.target.value)}
                  placeholder="99.90"
                  required
                />
              </div>

              <div className="form-field">
                <label>Saldo Devedor / Atraso (R$)</label>
                <input 
                  type="text" 
                  value={saldoDevedor}
                  onChange={e => setSaldoDevedor(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <small className="help-text">Valores maiores que 0 geram pendência financeira.</small>
              </div>

              <div className="form-field">
                <label>Próximo Vencimento</label>
                <input 
                  type="date" 
                  value={dataRenovacao}
                  onChange={e => setDataRenovacao(e.target.value)}
                  required
                />
              </div>

              <footer className="modal-card-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setEditingEmp(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-modal-save">
                  Salvar Alterações
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
