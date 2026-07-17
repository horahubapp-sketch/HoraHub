import { NavLink } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import logoImg from '../assets/logo.jpg';

export default function Header() {
  const { signOut, user } = useAuth();

  return (
    <header className="floating-header">
      <div className="header-container">
        <div className="header-brand">
          <img src={logoImg} alt="Encaixe Logo" className="header-logo" />
          <span className="brand-name">Encaixe</span>
        </div>

        <nav className="header-menu">
          <NavLink 
            to="/" 
            className={({ isActive }) => `header-link ${isActive ? 'active' : ''}`}
          >
            Agenda
          </NavLink>
          <NavLink 
            to="/admin/servicos" 
            className={({ isActive }) => `header-link ${isActive ? 'active' : ''}`}
          >
            Serviços
          </NavLink>
          <NavLink 
            to="/admin/equipe" 
            className={({ isActive }) => `header-link ${isActive ? 'active' : ''}`}
          >
            Equipe
          </NavLink>
          <NavLink 
            to="/admin/configuracoes" 
            className={({ isActive }) => `header-link ${isActive ? 'active' : ''}`}
          >
            Configurações
          </NavLink>
        </nav>

        <div className="header-actions">
          {user?.email === 'admin@horahub.com' && (
            <NavLink 
              to="/superadmin" 
              className="btn-superadmin-header"
            >
              <ShieldAlert size={16} />
              <span>Super Admin</span>
            </NavLink>
          )}
          <button className="btn-logout-header" onClick={signOut} title="Sair do painel">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
