import { NavLink } from 'react-router-dom';
import { ShieldAlert, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

// Importação direta dos assets de ícones
import scheduleImg from '../assets/schedule.png';
import servicesImg from '../assets/users-loyalty.png';
import teamImg from '../assets/people-poll.png';

export default function Sidebar() {
  const { signOut, user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-logo">E</span>
        <span className="brand-name">Encaixe</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink 
          to="/" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span 
            className="sidebar-schedule-icon"
            style={{
              maskImage: `url(${scheduleImg})`,
              WebkitMaskImage: `url(${scheduleImg})`
            }}
          ></span>
          <span className="sidebar-label">Agenda</span>
          <span className="badge-live">LIVE</span>
        </NavLink>

        <NavLink 
          to="/admin/servicos" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span 
            className="sidebar-custom-icon"
            style={{
              maskImage: `url(${servicesImg})`,
              WebkitMaskImage: `url(${servicesImg})`
            }}
          ></span>
            <span className="sidebar-label">Serviços</span>
        </NavLink>

        <NavLink 
          to="/admin/profissionais" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span 
            className="sidebar-people-poll-icon"
            style={{
              maskImage: `url(${teamImg})`,
              WebkitMaskImage: `url(${teamImg})`
            }}
          ></span>
            <span className="sidebar-label">Profissionais</span>
        </NavLink>

        {/* Grupo de Relatórios */}
        <div className="sidebar-group-container">
          <div className="sidebar-group-title">
            <span className="sidebar-label">Relatórios</span>
          </div>
          <div className="sidebar-sub-menu">
            <NavLink 
              to="/admin/relatorios/aniversariantes" 
              className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
            >
              <span>Aniversariantes</span>
            </NavLink>
          </div>
        </div>

        <NavLink 
          to="/admin/configuracoes" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} className="sidebar-icon" />
          <span className="sidebar-label">Configurações</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {(user?.email === 'admin@encaixe.com' || user?.email === 'admin@horahub.com' || user?.email === 'horahubapp@gmail.com') && (
          <NavLink 
            to="/superadmin" 
            className="sidebar-link btn-superadmin-link"
            style={{ 
              marginBottom: '12px', 
              border: '1px solid rgba(0, 230, 118, 0.2)', 
              backgroundColor: 'rgba(0, 230, 118, 0.05)', 
              color: '#00E676' 
            }}
          >
            <ShieldAlert size={20} style={{ color: '#00E676' }} />
            <span className="sidebar-label">Super Admin</span>
          </NavLink>
        )}
        <button className="btn-logout-sidebar" onClick={signOut} title="Sair do painel">
          <LogOut size={16} />
          <span>Sair da Conta</span>
        </button>
        <div className="system-status">
          <ShieldAlert size={16} />
          <span>Backoffice</span>
        </div>
      </div>
    </aside>
  );
}
