import { NavLink } from 'react-router-dom';
import { Calendar, Scissors, Users, ShieldAlert, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-logo">H</span>
        <span className="brand-name">HoraHub</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink 
          to="/" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Calendar size={20} className="sidebar-icon" />
          <span className="sidebar-label">Agenda</span>
          <span className="badge-live">LIVE</span>
        </NavLink>

        <NavLink 
          to="/admin/servicos" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Scissors size={20} className="sidebar-icon" />
          <span className="sidebar-label">Serviços</span>
        </NavLink>

        <NavLink 
          to="/admin/equipe" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Users size={20} className="sidebar-icon" />
          <span className="sidebar-label">Equipe</span>
        </NavLink>

        <NavLink 
          to="/admin/configuracoes" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} className="sidebar-icon" />
          <span className="sidebar-label">Configurações</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <ShieldAlert size={16} />
          <span>Backoffice</span>
        </div>
      </div>
    </aside>
  );
}
