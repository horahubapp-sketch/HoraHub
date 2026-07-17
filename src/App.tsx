import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Header from './components/Header';
import AgendaPage from './pages/AgendaPage';
import ServicosPage from './pages/ServicosPage';
import EquipePage from './pages/EquipePage';
import AgendarPage from './pages/AgendarPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import SuperAdminPage from './pages/SuperAdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';

// Layout Principal que engloba a barra lateral e o conteúdo da rota
function Layout() {
  const { empresa, signOut, user } = useAuth();
  
  // Apenas considera ativo se for o administrador padrão do seed OR se a empresa estiver ativa
  const isAtivo = (user?.email === 'admin@horahub.com') || (empresa && empresa.plano_status === 'ativo');
  
  // O blur é aplicado para qualquer estado que não seja ativo
  const aplicarBlur = !isAtivo;
  
  // Determina se exibe modal de pendente ou bloqueado
  const isPendente = !isAtivo && (!empresa || empresa.plano_status === 'pendente');
  const isBloqueado = !isAtivo && empresa && empresa.plano_status === 'bloqueado';

  return (
    <div className="app-container-relative" style={{ width: '100%' }}>
      <div className={`app-layout ${aplicarBlur ? 'pending-blur' : ''}`}>
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {isPendente && (
        <div className="pending-overlay">
          <div className="pending-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pending-icon-circle">
              <Clock size={28} />
            </div>

            <h2>Conta em Análise!</h2>
            <p className="pending-subtitle">O acesso ao painel do Encaixe está aguardando ativação.</p>

            <div className="pending-desc-box">
              Olá! Recebemos a solicitação de registro de <strong>{empresa?.nome || 'sua empresa'}</strong>. 
              <br /><br />
              Nossa equipe administrativa já foi notificada e está realizando a validação dos dados cadastrados corporativos. Em breve seu acesso completo será liberado e você poderá começar a utilizar o painel.
            </div>

            <div className="pending-actions-row">
              <button 
                onClick={() => window.location.reload()}
                className="btn-pending-verify"
              >
                Verificar se Fui Ativado
              </button>

              <button 
                onClick={signOut}
                className="btn-pending-logout"
              >
                <LogOut size={16} />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isBloqueado && (
        <div className="pending-overlay">
          <div className="pending-modal-card" style={{ borderTop: '4px solid #FF5252' }} onClick={e => e.stopPropagation()}>
            <div className="pending-icon-circle" style={{ backgroundColor: 'rgba(255, 82, 82, 0.1)', borderColor: 'rgba(255, 82, 82, 0.2)', color: '#FF5252' }}>
              <ShieldAlert size={28} />
            </div>

            <h2 style={{ color: '#FF5252' }}>Painel Suspenso!</h2>
            <p className="pending-subtitle">Acesso temporariamente suspenso devido a pendências financeiras.</p>

            <div className="pending-desc-box" style={{ borderLeft: '3px solid #FF5252' }}>
              Olá! O acesso ao painel do Encaixe para a empresa <strong>{empresa?.nome || 'seu estabelecimento'}</strong> está suspenso temporariamente por inadimplência ou faturas em aberto.
              <br /><br />
              Para regularizar a situação das faturas vencidas e reativar imediatamente o acesso ao sistema, por favor entre em contato com o suporte financeiro do Encaixe.
            </div>

            <div className="pending-actions-row">
              <button 
                onClick={() => window.location.reload()}
                className="btn-pending-verify"
              >
                Verificar se Fui Liberado
              </button>

              <button 
                onClick={signOut}
                className="btn-pending-logout"
              >
                <LogOut size={16} />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Configuração de rotas da aplicação
const router = createBrowserRouter([
  // Rotas de Autenticação
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/cadastro',
    element: <CadastroPage />,
  },
  // Portal Público do Cliente (Sem login)
  {
    path: '/agendar/:slug',
    element: <AgendarPage />,
  },
  // Rotas do Super Administrador (Apenas admin@horahub.com)
  {
    path: '/superadmin',
    element: <ProtectedRoute requireSuperAdmin={true} />,
    children: [
      {
        path: '',
        element: <SuperAdminPage />
      }
    ]
  },
  // Rotas Administrativas Protegidas (Exigem Login)
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            index: true,
            element: <AgendaPage />,
          },
          {
            path: 'admin/servicos',
            element: <ServicosPage />,
          },
          {
            path: 'admin/equipe',
            element: <EquipePage />,
          },
          {
            path: 'admin/configuracoes',
            element: <ConfiguracoesPage />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
