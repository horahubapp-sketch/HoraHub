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
import { AuthProvider } from './contexts/AuthContext';

// Layout Principal que engloba a barra lateral e o conteúdo da rota
function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
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
