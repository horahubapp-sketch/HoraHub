import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { User, Mail, Lock, Building, Link2, Sparkles, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import './CadastroPage.css';

export default function CadastroPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Inputs
  const [nomeDono, setNomeDono] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [slug, setSlug] = useState('');

  // Estados de Controle
  const [loading, setLoading] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [showSenha, setShowSenha] = useState(false);

  // Validação de Slug em tempo real
  const [slugDisponivel, setSlugDisponivel] = useState<boolean | null>(null);
  const [validandoSlug, setValidandoSlug] = useState(false);

  useEffect(() => {
    if (!slug) {
      setSlugDisponivel(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidandoSlug(true);
      try {
        // Normaliza o slug
        const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (normalized !== slug) {
          setSlug(normalized);
        }

        const { data, error } = await supabase
          .from('empresas')
          .select('id')
          .eq('slug', normalized);

        if (error) throw error;
        setSlugDisponivel(data.length === 0);
      } catch (err) {
        console.error('Erro ao validar slug:', err);
      } finally {
        setValidandoSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeDono || !email || !senha || !nomeEmpresa || !slug) {
      setErroMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (slugDisponivel === false) {
      setErroMsg('O link de agendamento escolhido já está em uso.');
      return;
    }

    setLoading(true);
    setErroMsg(null);
    setSucessoMsg(null);

    try {
      await signUp(nomeDono, email, senha, nomeEmpresa, slug);
      setSucessoMsg('Conta e empresa criadas com sucesso!');
      
      // Espera 2 segundos para o usuário ver o sucesso e navega para a agenda
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('[HoraHub] Erro de cadastro:', err);
      setErroMsg(err.message || 'Erro ao registrar sua conta e empresa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-bg-decor-1"></div>
      <div className="register-bg-decor-2"></div>

      <div className="register-glass-card">
        <header className="register-card-header">
          <div className="register-logo-circle">
            <Sparkles className="register-sparkle" size={24} />
          </div>
          <h1>Crie sua Conta</h1>
          <p>Cadastre sua empresa e comece a agendar hoje.</p>
        </header>

        {erroMsg && (
          <div className="register-error-banner">
            <AlertCircle size={18} />
            <span>{erroMsg}</span>
          </div>
        )}

        {sucessoMsg && (
          <div className="register-success-banner">
            <CheckCircle size={18} />
            <span>{sucessoMsg}</span>
          </div>
        )}

        <form onSubmit={handleCadastro} className="register-form" autoComplete="off">
          {/* Honeypot: inputs invisíveis para enganar o autofill do Chrome/Edge */}
          <div style={{ opacity: 0, position: 'absolute', height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <input type="text" name="username_fake" tabIndex={-1} aria-hidden="true" />
            <input type="password" name="password_fake" tabIndex={-1} aria-hidden="true" />
          </div>
          <div className="register-form-grid">
            {/* Bloco 1: Seus Dados */}
            <div className="register-section">
              <h3>Seus Dados Administrativos</h3>
              
              <div className="register-field-group">
                <label>Nome Completo</label>
                <div className="register-input-icon-wrapper">
                  <User size={18} className="register-input-icon" />
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    value={nomeDono}
                    onChange={e => setNomeDono(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="off"
                    readOnly
                    onFocus={e => e.currentTarget.removeAttribute('readOnly')}
                  />
                </div>
              </div>

              <div className="register-field-group">
                <label>E-mail Corporativo</label>
                <div className="register-input-icon-wrapper">
                  <Mail size={18} className="register-input-icon" />
                  <input 
                    type="email" 
                    placeholder="exemplo@empresa.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="off"
                    readOnly
                    onFocus={e => e.currentTarget.removeAttribute('readOnly')}
                  />
                </div>
              </div>

              <div className="register-field-group">
                <label>Escolha uma Senha</label>
                <div className="register-input-icon-wrapper" style={{ position: 'relative' }}>
                  <Lock size={18} className="register-input-icon" />
                  <input 
                    type={showSenha ? 'text' : 'password'} 
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    required
                    disabled={loading}
                    style={{ paddingRight: '48px' }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => setShowSenha(!showSenha)}
                    title={showSenha ? "Ocultar senha" : "Exibir senha"}
                    disabled={loading}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#A0A0B2',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      zIndex: 20,
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.color = '#00E676'}
                    onMouseOut={e => e.currentTarget.style.color = '#A0A0B2'}
                  >
                    {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bloco 2: Dados da Empresa */}
            <div className="register-section">
              <h3>Perfil da Empresa</h3>

              <div className="register-field-group">
                <label>Nome da Empresa / Clínica</label>
                <div className="register-input-icon-wrapper">
                  <Building size={18} className="register-input-icon" />
                  <input 
                    type="text" 
                    placeholder="Ex: Barbearia Estrela"
                    value={nomeEmpresa}
                    onChange={e => setNomeEmpresa(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="register-field-group">
                <label>Link Público Desejado (Slug URL)</label>
                <div className="register-input-icon-wrapper">
                  <Link2 size={18} className="register-input-icon" />
                  <input 
                    type="text" 
                    placeholder="barbearia-estrela"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="register-slug-preview">
                  Link final: <code>{window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'http://localhost:5173' : 'https://horahub.com.br'}/agendar/{slug || '...'}</code>
                </div>
                {slug && (
                  <div className="register-slug-status">
                    {validandoSlug ? (
                      <span className="validating">Validando link...</span>
                    ) : slugDisponivel === true ? (
                      <span className="available">✓ Link disponível!</span>
                    ) : slugDisponivel === false ? (
                      <span className="unavailable">✗ Link indisponível.</span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-register-submit" disabled={loading || slugDisponivel === false}>
            {loading ? 'Cadastrando...' : 'Cadastrar Empresa & Acessar'}
          </button>
        </form>

        <footer className="register-card-footer">
          <p>Já tem uma conta cadastrada?</p>
          <Link to="/login" className="register-login-link">
            Entrar no Painel
          </Link>
        </footer>
      </div>
    </div>
  );
}
