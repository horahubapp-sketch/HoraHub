import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({ requireSuperAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

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

  // Se exige super admin mas o e-mail não for o master
  if (requireSuperAdmin && user.email !== 'admin@horahub.com') {
    return <Navigate to="/" replace />;
  }

  // Se autenticado, libera o acesso às rotas filhas (Dashboard/Agenda)
  return <Outlet />;
}
