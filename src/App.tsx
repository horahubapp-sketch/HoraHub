import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AgendaPage from './pages/AgendaPage';
import ServicosPage from './pages/ServicosPage';
import EquipePage from './pages/EquipePage';
import AgendarPage from './pages/AgendarPage';

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
    ],
  },
  {
    path: 'agendar/:slug',
    element: <AgendarPage />,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
