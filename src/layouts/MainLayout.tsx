import React, { useState, useEffect } from 'react';
import { Layout, Dropdown, Space, Button, Spin, Avatar, Input } from 'antd';
import type { MenuProps } from 'antd';
import Sidebar from '../components/sidebar/Sidebar';
import {
  UserOutlined,
  LogoutOutlined, 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
  SettingOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createBaseMenuItems, createDevMenuItems, createAdminMenuItems, createProfileMenuItem } from '../constants/menuItems';
import type { CustomUser } from '../stores/userStore';
import '../styles/MainLayout.css';
import '../styles/global.css';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

interface UserMenuProps {
  signOut: () => Promise<void>;
}

const createUserMenuItems = ({ signOut }: UserMenuProps): MenuProps['items'] => [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Perfil',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Configuración',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Cerrar Sesión',
    onClick: async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    },
  }
];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  
  // Detectar si estamos en una pantalla móvil
  useEffect(() => {
    const checkScreenSizes = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsSmallScreen(width <= 576);
    };
    
    // Comprobar tamaño inicial
    checkScreenSizes();
    
    // Añadir event listener para redimensionamiento
    window.addEventListener('resize', checkScreenSizes);
    
    // Limpiar event listener
    return () => window.removeEventListener('resize', checkScreenSizes);
  }, []);
  
  // Preparamos los items del menú aunque no los usemos directamente aquí
  // para mantener la lógica en caso de que se necesite en el futuro
  React.useMemo(() => {
    const items = createBaseMenuItems(navigate);
    const role = user?.user_rol;

    if (role === 'dev') {
      items.push(...createDevMenuItems(navigate));
    } else if (role === 'admin') {
      items.push(...createAdminMenuItems(navigate));
    }

    items.push(createProfileMenuItem(navigate));

    return items;
  }, [navigate, user?.user_rol]);

  // Función para alternar la visibilidad del sidebar en móviles
  const toggleMobileMenu = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const renderUserInfo = (user: CustomUser) => (
    <Space className="user-avatar">
      <Avatar
        src={user.user_metadata?.avatar_url}
        icon={<UserOutlined />}
      />
    </Space>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large">
          <div className="loading-content">Cargando...</div>
        </Spin>
      </div>
    );
  }

  return (
    <Layout id="components-layout-demo-custom-trigger" style={{ background: 'transparent' }}>
      {/* Sidebar personalizado con bordes redondeados */}
      <Sidebar collapsed={collapsed} mobileVisible={sidebarVisible} setMobileVisible={setSidebarVisible} />
      <Layout 
        className="site-layout" 
        style={{ 
          marginLeft: isMobile ? '0' : (collapsed ? '100px' : '260px'),
          paddingTop: isMobile ? '0' : undefined
        }}
      >
        <Header 
          className="site-layout-header"
          style={{ 
            marginTop: '20px' /* Ya no necesitamos espacio extra para el botón de menú */
          }}
        >
          <div className="header-left">
            {isSmallScreen ? (
              // Botón de hamburguesa para móviles pequeños
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={toggleMobileMenu}
                className="trigger mobile-menu-button"
              />
            ) : !isMobile && (
              // Botón de colapso para pantallas más grandes
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="trigger"
              />
            )}
            {(!isMobile || showMobileSearch) && (
              <Input 
                prefix={<SearchOutlined />} 
                placeholder="Buscar..." 
                className="search-input"
                autoFocus={showMobileSearch}
                onBlur={() => isMobile && setShowMobileSearch(false)} 
              />
            )}
          </div>
          <div className="header-right">
            {isMobile && !showMobileSearch && (
              <Button 
                type="text" 
                icon={<SearchOutlined />} 
                onClick={() => setShowMobileSearch(true)}
                className="header-icon mobile-search-icon" 
              />
            )}
            <Button type="text" icon={<PlusOutlined />} className="header-icon" />
            <Button type="text" icon={<BellOutlined />} className="header-icon" />
            <div className="user-dropdown">
              {user && (
                <Dropdown menu={{ items: createUserMenuItems({ signOut }) }} trigger={['click']}>
                  {renderUserInfo(user)}
                </Dropdown>
              )}
            </div>
          </div>
        </Header>
        <Content className="site-layout-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
