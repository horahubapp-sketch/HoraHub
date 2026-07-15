import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, LogOut } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, loading, empresa, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0b0b0d',
        color: '#A0A0B2',
        fontFamily: 'Inter, sans-serif',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Inicializando sessão...
      </div>
    );
  }

  // Se não autenticado, redireciona para Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se a empresa foi carregada mas o status NÃO é ativo, exibe a tela de pendente
  if (empresa && empresa.plano_status !== 'ativo') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0b0b0d',
        fontFamily: 'Inter, sans-serif',
        color: '#FFFFFF',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          padding: '40px',
          borderRadius: '24px',
          backgroundColor: 'rgba(22, 22, 26, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 179, 0, 0.1)',
            border: '1px solid rgba(255, 179, 0, 0.2)',
            color: '#FFB300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            animation: 'pulse 2s infinite'
          }}>
            <Clock size={28} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Conta em Análise!
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#A0A0B2', margin: '0 0 24px 0' }}>
            O acesso ao painel do HoraHub está aguardando ativação.
          </p>

          <div style={{
            textAlign: 'left',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            color: '#E2E2E9'
          }}>
            Olá! Recebemos a solicitação de registro de <strong>{empresa.nome}</strong>. 
            <br /><br />
            Nossa equipe administrativa já foi notificada e está realizando a validação dos dados cadastrados corporativos. Em breve seu acesso completo será liberado e você poderá começar a utilizar o painel.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
            >
              Verificar se Fui Ativado
            </button>

            <button 
              onClick={signOut}
              style={{
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: '#FF5252',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se autenticado e ativo, libera o acesso às rotas filhas (Dashboard/Agenda)
  return <Outlet />;
}
