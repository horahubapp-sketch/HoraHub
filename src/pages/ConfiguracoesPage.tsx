import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building, 
  Mail, 
  Link, 
  Palette, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Eye
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
  const [corPrimaria, setCorPrimaria] = useState('#00E676');
  const [corSecundaria, setCorSecundaria] = useState('#121214');
  const [logoUrl, setLogoUrl] = useState('');

  // Validação de Slug
  const [slugDisponivel, setSlugDisponivel] = useState<boolean | null>(null);
  const [validandoSlug, setValidandoSlug] = useState(false);

  // 1. Carregar Configurações Atuais
  useEffect(() => {
    async function loadConfig() {
      if (!tenantId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('id, nome, email, slug, cor_primaria, cor_secundaria, logo_url')
          .eq('id', tenantId)
          .single();

        if (error) throw error;
        if (data) {
          setEmpresaId(data.id);
          setNome(data.nome);
          setEmail(data.email || '');
          setSlug(data.slug || '');
          setCorPrimaria(data.cor_primaria || '#00E676');
          setCorSecundaria(data.cor_secundaria || '#121214');
          setLogoUrl(data.logo_url || '');
        }
      } catch (err: any) {
        console.error('[HoraHub] Erro ao carregar configurações:', err);
        setErroMsg('Erro ao carregar os dados da empresa do banco local.');
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

        const { data, error } = await supabase
          .from('empresas')
          .select('id')
          .eq('slug', normalized)
          .neq('id', empresaId);

        if (error) throw error;

        // Se encontrar registros, o slug está ocupado
        setSlugDisponivel(data.length === 0);
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

    // 2. Upload real no storage do Supabase
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${tenantId || 'global'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.warn('[HoraHub] Falha no storage do Supabase local. Mantendo Base64 offline:', uploadError.message);
        setUploadingLogo(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
    } catch (err) {
      console.warn('[HoraHub] Erro no upload da logo. Preservado Base64.');
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
      const { error } = await supabase
        .from('empresas')
        .update({
          nome,
          email,
          slug,
          cor_primaria: corPrimaria,
          cor_secundaria: corSecundaria,
          logo_url: logoUrl
        })
        .eq('id', empresaId);

      if (error) throw error;

      await refreshEmpresa();
      setSucessoMsg('Configurações salvas e aplicadas com sucesso!');
      
      // Esconder a mensagem de sucesso após 3 segundos
      setTimeout(() => setSucessoMsg(null), 3000);
    } catch (err: any) {
      console.error('[HoraHub] Erro ao salvar configurações:', err);
      setErroMsg(err.message || 'Erro de conexão ao gravar dados.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return <div className="config-loading">Carregando parametrizações...</div>;
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
              <Link size={16} className="config-icon" />
              <input 
                type="text" 
                placeholder="barbearia-bruno"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
              />
            </div>
            <div className="slug-preview-subtext">
               Link final: <code>{window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:5173' : 'https://horahub.com.br'}/agendar/{slug || '...'}</code>
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
