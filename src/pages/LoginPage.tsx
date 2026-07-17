import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';
import logoImg from '../assets/logo.jpg';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setErroMsg('Preencha todos os campos para fazer login.');
      return;
    }

    setLoading(true);
    setErroMsg(null);

    try {
      await signIn(email, senha);
      navigate('/'); // Vai para a agenda administrativa
    } catch (err: any) {
      console.error('[HoraHub] Erro de login:', err);
      // Traduzir erros comuns do Supabase Auth para o usuário
      if (err.message?.includes('Invalid login credentials')) {
        setErroMsg('E-mail ou senha incorretos.');
      } else {
        setErroMsg(err.message || 'Erro ao conectar ao servidor de autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Background Decorativo */}
      <div className="login-bg-decor-1"></div>
      <div className="login-bg-decor-2"></div>

      <div className="login-glass-card">
        <header className="login-card-header">
          <div className="login-logo-circle" style={{ background: 'none', boxShadow: 'none' }}>
            <img src={logoImg} alt="Encaixe Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <h1>Encaixe</h1>
          <p style={{ color: '#00E676', fontWeight: 600, fontSize: '0.95rem', margin: '4px 0' }}>Marque, Encaixe, simples assim.</p>
          <p style={{ fontSize: '0.85rem', color: '#A0A0B2', margin: 0 }}>Sua Agenda Inteligente</p>
        </header>

        {erroMsg && (
          <div className="login-error-banner">
            <AlertCircle size={18} />
            <span>{erroMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field-group">
            <label>E-mail Corporativo</label>
            <div className="login-input-icon-wrapper">
              <Mail size={18} className="login-input-icon" />
              <input 
                type="email" 
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field-group">
            <label>Sua Senha</label>
            <div className="login-input-icon-wrapper" style={{ position: 'relative' }}>
              <Lock size={18} className="login-input-icon" />
              <input 
                type={showSenha ? 'text' : 'password'} 
                placeholder="Digite sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: '48px' }}
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

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? (
              <span>Entrando...</span>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <footer className="login-card-footer">
          <p>Não tem conta no Encaixe?</p>
          <Link to="/cadastro" className="login-register-link">
            Cadastrar minha Empresa
          </Link>
        </footer>
      </div>
    </div>
  );
}
