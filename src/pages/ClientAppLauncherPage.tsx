import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbAdapter } from '../services/dbAdapter';
import { Search, Clock, ArrowRight, Sparkles, Building2, Store } from 'lucide-react';
import './ClientAppLauncherPage.css';
import logoImg from '../assets/logo.jpg';

interface RecentSlug {
  slug: string;
  nome: string;
  logoUrl?: string;
  dataAcesso: string;
}

interface EmpresaCadastrada {
  id: string;
  nome: string;
  slug: string;
  logo_url?: string;
}

export default function ClientAppLauncherPage() {
  const navigate = useNavigate();
  const [slugInput, setSlugInput] = useState('');
  const [recientes, setRecientes] = useState<RecentSlug[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaCadastrada[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  useEffect(() => {
    // 1. Carregar estabelecimentos recentemente visitados
    const salvos = localStorage.getItem('encaixe_recent_slugs');
    if (salvos) {
      try {
        setRecientes(JSON.parse(salvos));
      } catch (e) {
        console.error('Erro ao ler recentes:', e);
      }
    }

    async function loadEmpresas() {
      try {
        const data = await dbAdapter.empresas.getAll();
        setEmpresas(data || []);
      } catch (e) {
        console.error('Erro ao buscar empresas:', e);
      } finally {
        setLoadingEmpresas(false);
      }
    }
    loadEmpresas();
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slugInput.trim()) return;

    const slugFormatado = slugInput
      .trim()
      .toLowerCase()
      .replace(/https?:\/\/[^\/]+\/agendar\//, '')
      .replace(/[^a-z0-9-]/g, '');

    if (slugFormatado) {
      navigate(`/agendar/${slugFormatado}`);
    }
  };

  const empresasFiltradas = empresas.filter(emp =>
    emp.nome.toLowerCase().includes(slugInput.toLowerCase()) ||
    emp.slug.toLowerCase().includes(slugInput.toLowerCase())
  );

  return (
    <div className="launcher-wrapper">
      <div className="launcher-card">
        {/* Cabeçalho do App de Apontamento do Cliente */}
        <div className="launcher-header">
          <div className="launcher-brand">
            <img src={logoImg} alt="Encaixe" className="launcher-logo" />
            <div className="launcher-brand-text">
              <h1>Encaixe App</h1>
              <p>Agende seu serviço com rapidez e facilidade.</p>
            </div>
          </div>
        </div>

        {/* Busca do Estabelecimento */}
        <div className="launcher-search-section">
          <h2>Encontre o Estabelecimento</h2>
          <p className="search-desc">Digite o nome ou selecione o local onde deseja agendar:</p>

          <form onSubmit={handleBuscar} className="launcher-search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Buscar barbearia, clínica, salão..."
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Lista de Estabelecimentos Recentes no Dispositivo */}
        {recientes.length > 0 && !slugInput.trim() && (
          <div className="launcher-recent-section">
            <div className="recent-section-header">
              <Clock size={18} />
              <h3>Visitados Recentemente</h3>
            </div>

            <div className="recent-grid">
              {recientes.map((item) => (
                <div
                  key={item.slug}
                  className="recent-card-item"
                  onClick={() => navigate(`/agendar/${item.slug}`)}
                >
                  <div className="recent-icon-circle">
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.nome} className="recent-logo-img" />
                    ) : (
                      <Store size={22} />
                    )}
                  </div>

                  <div className="recent-info">
                    <h4>{item.nome}</h4>
                    <span className="recent-slug-badge">/agendar/{item.slug}</span>
                  </div>

                  <ArrowRight size={16} className="recent-arrow" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catálogo de Empresas Disponíveis no Encaixe */}
        <div className="launcher-recent-section">
          <div className="recent-section-header">
            <Building2 size={18} />
            <h3>Estabelecimentos no Encaixe</h3>
          </div>

          {loadingEmpresas ? (
            <div style={{ color: '#94A3B8', fontSize: '0.88rem', padding: '12px 0' }}>Carregando empresas disponíveis...</div>
          ) : empresasFiltradas.length === 0 ? (
            <div style={{ color: '#94A3B8', fontSize: '0.88rem', padding: '12px 0' }}>
              Nenhum lugar encontrado com "{slugInput}".
            </div>
          ) : (
            <div className="recent-grid">
              {empresasFiltradas.map((emp) => (
                <div
                  key={emp.id}
                  className="recent-card-item"
                  onClick={() => navigate(`/agendar/${emp.slug}`)}
                >
                  <div className="recent-icon-circle">
                    {emp.logo_url ? (
                      <img src={emp.logo_url} alt={emp.nome} className="recent-logo-img" />
                    ) : (
                      <Store size={22} />
                    )}
                  </div>

                  <div className="recent-info">
                    <h4>{emp.nome}</h4>
                    <span className="recent-slug-badge">/agendar/{emp.slug}</span>
                  </div>

                  <ArrowRight size={16} className="recent-arrow" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé do App */}
        <div className="launcher-footer">
          <Sparkles size={16} className="sparkle-icon" />
          <span>Sua plataforma inteligente de agendamentos online</span>
        </div>
      </div>
    </div>
  );
}
