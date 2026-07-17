import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import logoImg from '../assets/logo.jpg';

export default function Header() {
  const { signOut, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

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
          <div className="profile-menu-container">
            <button 
              className="avatar-btn" 
              onClick={() => setShowDropdown(!showDropdown)}
              title="Menu do Usuário"
            >
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </button>
            
            {showDropdown && (
              <>
                {/* Overlay transparente para fechar ao clicar fora */}
                <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
                
                <div className="profile-dropdown-card">
                  <div className="profile-dropdown-header">
                    <span className="profile-email">{user?.email}</span>
                    <span className="profile-role">
                      {user?.email === 'admin@horahub.com' ? 'Super Administrador' : 'Administrador'}
                    </span>
                  </div>
                  
                  <div className="profile-dropdown-divider" />
                  
                  <div className="profile-dropdown-body">
                    {user?.email === 'admin@horahub.com' && (
                      <NavLink 
                        to="/superadmin" 
                        className="dropdown-item superadmin-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <ShieldAlert size={16} />
                        <span>Super Admin</span>
                      </NavLink>
                    )}
                    <NavLink 
                      to="/admin/configuracoes" 
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings size={16} />
                      <span>Configurações</span>
                    </NavLink>
                  </div>
                  
                  <div className="profile-dropdown-divider" />
                  
                  <div className="profile-dropdown-footer">
                    <button 
                      className="dropdown-item logout-item" 
                      onClick={() => { setShowDropdown(false); signOut(); }}
                    >
                      <LogOut size={16} />
                      <span>Sair do Painel</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
