import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AgendaPage from './pages/AgendaPage';
import ServicosPage from './pages/ServicosPage';
import EquipePage from './pages/EquipePage';
import AgendarPage from './pages/AgendarPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Clock, LogOut } from 'lucide-react';

// Layout Principal que engloba a barra lateral e o conteúdo da rota
function Layout() {
  const { empresa, signOut } = useAuth();
  const isPendente = empresa && empresa.plano_status !== 'ativo';

  return (
    <div className="app-container-relative" style={{ width: '100%' }}>
      <div className={`app-layout ${isPendente ? 'pending-blur' : ''}`}>
        <Sidebar />
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
            <p className="pending-subtitle">O acesso ao painel do HoraHub está aguardando ativação.</p>

            <div className="pending-desc-box">
              Olá! Recebemos a solicitação de registro de <strong>{empresa.nome}</strong>. 
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
