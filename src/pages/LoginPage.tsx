import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
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
          <div className="login-logo-circle">
            <Sparkles className="login-sparkle" size={24} />
          </div>
          <h1>HoraHub</h1>
          <p>Painel Administrativo White Label</p>
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
            <div className="login-input-icon-wrapper">
              <Lock size={18} className="login-input-icon" />
              <input 
                type="password" 
                placeholder="Digite sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                disabled={loading}
              />
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
          <p>Não tem conta no HoraHub?</p>
          <Link to="/cadastro" className="login-register-link">
            Cadastrar minha Empresa
          </Link>
        </footer>
      </div>
    </div>
  );
}
