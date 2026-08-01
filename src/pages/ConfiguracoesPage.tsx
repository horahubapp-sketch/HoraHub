import { useState, useEffect } from 'react';
import { dbAdapter } from '../services/dbAdapter';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Mail, 
  Link2, 
  Palette, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Eye,
  ShieldAlert
} from 'lucide-react';
import './ConfiguracoesPage.css';

export default function ConfiguracoesPage() {
  const { tenantId, refreshEmpresa } = useAuth();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // States do Form
  const [empresaId, setEmpresaId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#00E676');
  const [corSecundaria, setCorSecundaria] = useState('#121214');
  const [logoUrl, setLogoUrl] = useState('');
  const [regraSemPreferencia, setRegraSemPreferencia] = useState('algoritmo');
  const [profissionalIndicadoId, setProfissionalIndicadoId] = useState('');
  const [funcionarios, setFuncionarios] = useState<any[]>([]);

  // Validação de Slug
  const [slugDisponivel, setSlugDisponivel] = useState<boolean | null>(null);
  const [validandoSlug, setValidandoSlug] = useState(false);

  // 1. Carregar Configurações Atuais (Estritamente isolado por tenantId)
  useEffect(() => {
    async function loadConfig() {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErroMsg(null);

      try {
        const data = await dbAdapter.empresas.getById(tenantId);
        if (data) {
          setEmpresaId(data.id);
          setNome(data.nome);
          setEmail(data.email || '');
          setSlug(data.slug || '');
          setCpfCnpj(data.cpf_cnpj || '');
          setCorPrimaria(data.cor_primaria || '#00E676');
          setCorSecundaria(data.cor_secundaria || '#121214');
          setLogoUrl(data.logo_url || '');
          setRegraSemPreferencia(data.regra_sem_preferencia || 'algoritmo');
          setProfissionalIndicadoId(data.profissional_indicado_padrao_id || '');
        }

        const funcs = await dbAdapter.funcionarios.getByTenant(tenantId);
        setFuncionarios(funcs || []);
      } catch (err: any) {
        console.error('[Encaixe] Erro ao carregar empresa:', err);
        setErroMsg('Não foi possível carregar as configurações do estabelecimento.');
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [tenantId]);

  // 2. Validar Unicidade de Slug em Tempo Real
  useEffect(() => {
    if (!slug) {
      setSlugDisponivel(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidandoSlug(true);
      try {
        // Normaliza o slug (minusculas, sem espaços, apenas letras, numeros e hifens)
        const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (normalized !== slug) {
          setSlug(normalized);
        }

        const disponivel = await dbAdapter.empresas.checkSlug(normalized, empresaId);
        setSlugDisponivel(disponivel);
      } catch (err) {
        console.error('Erro ao validar slug:', err);
      } finally {
        setValidandoSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, empresaId]);

  // Upload Híbrido de Logotipo local/online
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErroMsg('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErroMsg('A imagem deve ter no máximo 2MB.');
      return;
    }

    setUploadingLogo(true);
    setErroMsg(null);

    // 1. Fallback visual Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${tenantId || 'global'}/${fileName}`;

      const publicUrl = await dbAdapter.storage.upload('avatars', filePath, file);
      setLogoUrl(publicUrl);
    } catch (err) {
      console.warn('[Encaixe] Erro no upload da logo. Preservado Base64.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // 3. Salvar no Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !slug) {
      setErroMsg('Nome e Link de Agendamento são campos obrigatórios.');
      return;
    }

    if (slugDisponivel === false) {
      setErroMsg('Este link de agendamento já está em uso por outro estabelecimento.');
      return;
    }

    setSalvando(true);
    setSucessoMsg(null);
    setErroMsg(null);

    try {
      const payload = {
        nome,
        email,
        slug,
        cpf_cnpj: cpfCnpj,
        cor_primaria: corPrimaria,
        cor_secundaria: corSecundaria,
        logo_url: logoUrl,
        regra_sem_preferencia: regraSemPreferencia,
        profissional_indicado_padrao_id: profissionalIndicadoId || null
      };

      await dbAdapter.empresas.saveConfig(tenantId!, payload);
      await refreshEmpresa();
      setSucessoMsg('Configurações salvas e aplicadas com sucesso!');
      setTimeout(() => setSucessoMsg(null), 3000);
    } catch (err: any) {
      console.error('[Encaixe] Erro ao salvar configurações:', err);
      setErroMsg(err.message || 'Erro ao gravar dados.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return <div className="config-loading">Carregando parametrizações...</div>;
  }

  if (!empresaId) {
    return (
      <div className="config-page-container">
        <div style={{
          background: 'rgba(24, 24, 27, 0.85)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          color: '#FFFFFF',
          maxWidth: '650px',
          margin: '60px auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <ShieldAlert size={48} style={{ color: '#00E676', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#FFFFFF' }}>Modo Super Administrador</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Você está conectado com uma conta de administração global da plataforma. Os dados cadastrais de cada cliente são estritamente isolados por estabelecimento e protegidos por políticas de segurança.
          </p>
          <Link to="/superadmin" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: '#00E676',
            color: '#09090B',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 700,
            textDecoration: 'none'
          }}>
            Gerenciar Plataforma no Super Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="config-page-container">
      {/* Título Principal */}
      <header className="config-header">
        <h1>Configurações da Empresa</h1>
        <p>Defina o perfil corporativo, o link de agendamento público e a identidade visual da sua marca.</p>
      </header>

      {/* Alertas */}
      {sucessoMsg && (
        <div className="config-alert success">
          <CheckCircle size={18} />
          <span>{sucessoMsg}</span>
        </div>
      )}

      {erroMsg && (
        <div className="config-alert error">
          <AlertCircle size={18} />
          <span>{erroMsg}</span>
        </div>
      )}

      <div className="config-grid">
        {/* Formulário Principal */}
        <form onSubmit={handleSave} className="config-form-card">
          <h2>
            <Building size={20} />
            Perfil e Parametrizações
          </h2>
          
          <div className="form-group-config">
            <label>Nome do Estabelecimento</label>
            <input 
              type="text" 
              placeholder="Ex: Barbearia do Bruno"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group-config">
            <label>CPF / CNPJ do Estabelecimento</label>
            <input 
              type="text" 
              placeholder="000.000.000-00 ou 00.000.000/0001-00"
              value={cpfCnpj}
              onChange={e => setCpfCnpj(e.target.value)}
            />
          </div>

          <div className="form-group-config">
            <label>Regra para Agendamento "Sem Preferência"</label>
            <select
              className="config-select-rule"
              value={regraSemPreferencia}
              onChange={e => setRegraSemPreferencia(e.target.value)}
            >
              <option value="algoritmo">Algoritmo Inteligente (Aloca o profissional com agenda mais livre)</option>
              <option value="fixo">Indicar um profissional fixo de preferência</option>
            </select>
          </div>

          {regraSemPreferencia === 'fixo' && (
            <div className="form-group-config">
              <label>Profissional Indicado Padrão</label>
              <select
                className="config-select-rule"
                value={profissionalIndicadoId}
                onChange={e => setProfissionalIndicadoId(e.target.value)}
              >
                <option value="">Selecione um profissional padrão...</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group-config">
            <label>E-mail de Contato</label>
            <div className="config-input-wrapper">
              <Mail size={16} className="config-icon" />
              <input 
                type="email" 
                placeholder="contato@empresa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-config">
            <label>Link de Auto-Agendamento (Slug da URL)</label>
            <div className="config-input-wrapper">
              <Link2 size={16} className="config-icon" />
              <input 
                type="text" 
                placeholder="barbearia-bruno"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
              />
            </div>
            <div className="slug-preview-subtext">
               Link final: <code>{window.location.origin}/agendar/{slug || '...'}</code>
            </div>
            {slug && (
              <div className="slug-validation-status">
                {validandoSlug ? (
                  <span className="validating">Validando disponibilidade...</span>
                ) : slugDisponivel === true ? (
                  <span className="available">✓ Link disponível!</span>
                ) : slugDisponivel === false ? (
                  <span className="unavailable">✗ Este link já está em uso por outra empresa.</span>
                ) : null}
              </div>
            )}
          </div>

          <div className="form-group-config">
            <label>Logotipo da Empresa</label>
            <div className="logo-upload-wrapper">
              <div className="logo-thumbnail-preview">
                {logoUrl ? (
                  <img src={logoUrl} alt="Thumbnail do Logo" />
                ) : (
                  <div className="logo-thumbnail-placeholder">★</div>
                )}
              </div>

              <div className="logo-inputs-block">
                <input 
                  type="text" 
                  placeholder="URL da imagem (ex: https://exemplo.com/logo.png)"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="input-logo-url"
                />

                <label className="btn-upload-logo-local">
                  {uploadingLogo ? 'Enviando...' : 'Carregar Imagem Local'}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    style={{ display: 'none' }}
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-save-config" disabled={salvando || slugDisponivel === false}>
            <Save size={18} />
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>

        {/* Painel Lateral: Custom Branding e Preview */}
        <div className="config-branding-card">
          <h2>
            <Palette size={20} />
            Identidade Visual (Branding)
          </h2>

          <div className="color-pickers-row">
            <div className="picker-block">
              <label>Cor Principal (Destaque)</label>
              <div className="picker-input-wrapper">
                <input 
                  type="color" 
                  value={corPrimaria}
                  onChange={e => setCorPrimaria(e.target.value)}
                />
                <code>{corPrimaria.toUpperCase()}</code>
              </div>
            </div>

            <div className="picker-block">
              <label>Cor de Fundo do Portal</label>
              <div className="picker-input-wrapper">
                <input 
                  type="color" 
                  value={corSecundaria}
                  onChange={e => setCorSecundaria(e.target.value)}
                />
                <code>{corSecundaria.toUpperCase()}</code>
              </div>
            </div>
          </div>

          {/* Simulador/Preview Visual em tempo real */}
          <div className="booking-preview-container">
            <div className="preview-header">
              <Eye size={14} />
              <span>Visualização do Portal do Cliente (Preview)</span>
            </div>

            <div 
              className="preview-portal-body"
              style={{ backgroundColor: corSecundaria }}
            >
              <div className="preview-portal-header">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="preview-logo" />
                ) : (
                  <div className="preview-logo-placeholder">★</div>
                )}
                <h3>{nome || 'Nome da sua Empresa'}</h3>
                <p>Agendamento rápido, seguro e sem filas.</p>
              </div>

              <div className="preview-booking-step">
                <span className="step-tag">Passo 1: Escolha o Serviço</span>
                
                {/* Exemplo de Card de Serviço simulando as cores reais */}
                <div 
                  className="preview-service-card"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <div className="service-info">
                    <h4>Corte Degradê</h4>
                    <span className="duration">45 min</span>
                  </div>
                  <strong style={{ color: corPrimaria }}>R$ 60,00</strong>
                </div>

                <button 
                  type="button" 
                  className="preview-btn-accent"
                  style={{ backgroundColor: corPrimaria }}
                >
                  Confirmar Horário
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
