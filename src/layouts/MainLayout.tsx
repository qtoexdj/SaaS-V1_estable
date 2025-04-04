import React, { useState } from 'react';
import { Layout, Menu, theme, Dropdown, Space, Typography, Button, Spin, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createBaseMenuItems, createDevMenuItems, createAdminMenuItems, createProfileMenuItem } from '../constants/menuItems';
import type { CustomUser } from '../stores/userStore';
import '../styles/MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

interface UserMenuProps {
  signOut: () => Promise<void>;
}

const createUserMenuItems = ({ signOut }: UserMenuProps): MenuProps['items'] => [
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
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = React.useMemo(() => {
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
        style={{
          backgroundColor: user.user_metadata?.avatar_url ? 'transparent' : '#1890ff'
        }}
      />
      <Text strong>
        {user.nombre ?? 'Usuario'}
        {user.user_rol ? ` (${user.user_rol})` : ''}
      </Text>
    </Space>
  );

  if (loading) {
    return (
      <div className="loading-container" style={{ background: colorBgContainer }}>
        <Spin size="large">
          <div className="loading-content">Cargando...</div>
        </Spin>
      </div>
    );
  }

  return (
    <Layout id="components-layout-demo-custom-trigger">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="site-layout-sider"
      >
        <div className="logo">
          {collapsed ? 'S' : 'SaaS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-header" style={{ background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger"
          />
          <div className="user-dropdown">
            {user && (
              <Dropdown menu={{ items: createUserMenuItems({ signOut }) }} trigger={['click']}>
                {renderUserInfo(user)}
              </Dropdown>
            )}
          </div>
        </Header>
        <Content
          className="site-layout-content"
          style={{ borderRadius: borderRadiusLG }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
