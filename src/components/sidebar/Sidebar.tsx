import React from 'react';
import logoImage from './logo/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { Switch } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { createBaseMenuItems, createDevMenuItems, createAdminMenuItems, createProfileMenuItem, createUtilityMenuItems } from '../../constants/menuItems';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
}
const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Usar los elementos del menú del sistema original
  const baseMenuItems = createBaseMenuItems(navigate);
  const roleMenuItems = user?.user_rol === 'dev'
    ? createDevMenuItems(navigate)
    : user?.user_rol === 'admin'
    ? createAdminMenuItems(navigate)
    : [];
  const profileMenuItem = createProfileMenuItem(navigate);
  
  // Combinar los menús como en el layout original
  const menuItems = [
    ...baseMenuItems,
    ...roleMenuItems,
    profileMenuItem
  ];

  // Obtener los elementos de utilidad
  const utilityMenuItems = createUtilityMenuItems(navigate);

  const isMenuItemActive = (item: any) => {
    const currentPath = location.pathname;
    
    // Para el dashboard
    if (item.key === 'dashboard' && currentPath === '/dashboard') {
      return true;
    }
    
    // Para los elementos de admin
    if (user?.user_rol === 'admin' && currentPath.includes(`/admin/${item.key}`)) {
      return true;
    }
    
    // Para los elementos de dev
    if (user?.user_rol === 'dev' && currentPath.includes(`/dev/${item.key}`)) {
      return true;
    }
    
    // Para el perfil
    if (item.key === 'profile' && currentPath === '/profile') {
      return true;
    }
    
    // Para ayuda y soporte
    if (item.key === 'support' && currentPath === '/support') {
      return true;
    }
    
    return false;
  };

  const renderMenuItem = (item: any) => (
    <div
      key={item.key}
      className={`menu-item ${isMenuItemActive(item) ? 'active' : ''}`}
      onClick={item.onClick}
    >
      <span className="menu-item-icon">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </div>
  );

  return (
    <div className="sidebar" style={{ width: collapsed ? '80px' : '240px' }}>
      <div className="logo">
        <div className="avatar-container">
          <img
            src={logoImage}
            alt="Logo"
            className="logo-image"
          />
        </div>
        
        {!collapsed && (
          <div className="logo-text">
            <h1>BROKY</h1>
          </div>
        )}
      </div>

      <div className="nav-menu">
        {menuItems.map(item => renderMenuItem(item))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        {utilityMenuItems.map(item => renderMenuItem(item))}
        
        <div className="dark-mode-toggle">
          {!collapsed && (
            <span className="mode-text">
              <span className="mode-icon">
                {themeMode === 'light' ? <SunOutlined /> : <MoonOutlined />}
              </span>
              <span>Modo {themeMode === 'light' ? 'Claro' : 'Oscuro'}</span>
            </span>
          )}
          <Switch
            checked={themeMode === 'dark'}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;