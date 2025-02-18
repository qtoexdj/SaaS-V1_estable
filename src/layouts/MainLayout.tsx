import React, { useMemo, useState } from 'react';
import { Layout, Menu, theme, Dropdown, Space, Typography, Button } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, TeamOutlined, ProjectOutlined, ContactsOutlined, NotificationOutlined, MessageOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { role, user, inmobiliariaName, signOut } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

  const menuItems = useMemo(() => {
    const items = [
      {
        key: 'dashboard',
        icon: <UserOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/dashboard'),
      }
    ];

    if (role === 'dev') {
      items.push({
        key: 'real-estate',
        icon: <HomeOutlined />,
        label: 'Inmobiliarias',
        onClick: () => navigate('/real-estate'),
      },
      {
        key: 'users',
        icon: <TeamOutlined />,
        label: 'Usuarios',
        onClick: () => navigate('/users'),
      },
      {
        key: 'projects',
        icon: <HomeOutlined />,
        label: 'Proyectos',
        onClick: () => navigate('/projects-dev'),
      });
    } else if (role === 'admin') {
      items.push(
        {
          key: 'sellers',
          icon: <TeamOutlined />,
          label: 'Vendedores',
          onClick: () => navigate('/users-admin'),
        },
        {
          key: 'prospects',
          icon: <ContactsOutlined />,
          label: 'Prospectos',
          onClick: () => navigate('/prospects-admin'),
        },
        {
          key: 'projects',
          icon: <ProjectOutlined />,
          label: 'Proyectos',
          onClick: () => navigate('/projects-admin'),
        },
        {
          key: 'push-campaigns',
          icon: <NotificationOutlined />,
          label: 'Campañas Push',
          onClick: () => navigate('/push-campaigns-admin'),
        },
        {
          key: 'chat',
          icon: <MessageOutlined />,
          label: 'Chat',
          onClick: () => navigate('/chat-admin'),
        }
      );
    }

    return items;
  }, [role, navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                      fontSize: '16px',
                      width: 64,
                      height: 64,
                    }}
                  />
                  <Space style={{ justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
                    {inmobiliariaName && (
                      <Text strong style={{ fontSize: 16 }}>
                        {inmobiliariaName}
                      </Text>
                    )}
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <UserOutlined />
                <Text>{user?.nombre} {role ? `(${role})` : ''}</Text>
              </Space>
            </Dropdown>
          </Space>
                  </Header>
                  <Content style={{
                      margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};