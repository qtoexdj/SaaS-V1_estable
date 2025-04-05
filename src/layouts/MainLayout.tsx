import React, { useState } from 'react';
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
  SettingOutlined
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
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  
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
      <Sidebar collapsed={collapsed} />
      <Layout className="site-layout" style={{ marginLeft: collapsed ? '100px' : '260px' }}>
        <Header className="site-layout-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger"
            />
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="Buscar cuentas, proyectos, usuarios..." 
              className="search-input" 
            />
          </div>
          <div className="header-right">
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
