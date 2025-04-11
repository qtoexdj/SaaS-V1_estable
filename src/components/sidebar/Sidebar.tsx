import React, { useEffect, useState } from 'react';
import logoImage from './logo/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  SunOutlined,
  MoonOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { Switch } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { createBaseMenuItems, createDevMenuItems, createAdminMenuItems, createProfileMenuItem, createUtilityMenuItems } from '../../constants/menuItems';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  mobileVisible?: boolean;
  setMobileVisible?: (visible: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileVisible = false, setMobileVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Detectar si estamos en una pantalla realmente móvil
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 576);
    };
    
    // Comprobar tamaño inicial
    checkScreenSize();
    
    // Añadir event listener para redimensionamiento
    window.addEventListener('resize', checkScreenSize);
    
    // Limpiar event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Cerrar el menú cuando cambia la ruta (navegación)
  useEffect(() => {
    if (setMobileVisible) {
      setMobileVisible(false);
    }
  }, [location.pathname, setMobileVisible]);

  // Usar los elementos del menú del sistema original
  const baseMenuItems = createBaseMenuItems(navigate);
  const roleMenuItems = user?.user_rol === 'dev'
    ? createDevMenuItems(navigate)
    : user?.user_rol === 'admin'
    ? createAdminMenuItems(navigate)
    : [];
  const profileMenuItem = createProfileMenuItem(navigate);
  
  // Obtener los elementos de utilidad
  const utilityMenuItems = createUtilityMenuItems(navigate);
  
  // Combinar los menús como en el layout original, ahora incluyendo el soporte en el menú principal
  const menuItems = [
    ...baseMenuItems,
    ...roleMenuItems,
    profileMenuItem,
    ...utilityMenuItems, // Añadimos el menú de ayuda y soporte aquí
  ];

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

  // En modo móvil, ignoramos la propiedad collapsed para mostrar el texto
  const isMobileView = window.innerWidth <= 768;
  const shouldCollapse = isMobileView ? false : collapsed;

  const renderMenuItem = (item: any) => (
    <div
      key={item.key}
      className={`menu-item ${isMenuItemActive(item) ? 'active' : ''}`}
      onClick={item.onClick}
    >
      <span className="menu-item-icon">{item.icon}</span>
      {!shouldCollapse && <span>{item.label}</span>}
    </div>
  );

  return (
    <>
      {/* Overlay para móviles */}
      <div 
        className={`sidebar-overlay ${mobileVisible ? 'visible' : ''}`} 
        onClick={() => setMobileVisible && setMobileVisible(false)}
      />
      
      {/* Botón hamburguesa solo para móviles pequeños */}
      {isSmallScreen && (
        <div className="mobile-trigger" onClick={() => setMobileVisible && setMobileVisible(!mobileVisible)}>
          <MenuOutlined />
        </div>
      )}
      
      <div 
        className={`sidebar ${mobileVisible ? 'visible' : ''}`} 
        style={{ width: isMobileView ? '240px' : (collapsed ? '80px' : '240px') }}
      >
        <div className="logo">
          <div className="avatar-container">
            <img
              src={logoImage}
              alt="Logo"
              className="logo-image"
            />
          </div>
          
          {!shouldCollapse && (
            <div className="logo-text">
              <h1>Broky</h1>
            </div>
          )}
        </div>

        <div className="nav-menu">
          {menuItems.map(item => renderMenuItem(item))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="dark-mode-toggle">
            {!shouldCollapse && (
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
    </>
  );
};

export default Sidebar;