import React, { useState } from 'react';
import { Layout, Menu, theme, Dropdown, Space, Typography, Button, Spin, Avatar } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  TeamOutlined, 
  ProjectOutlined, 
  ContactsOutlined, 
  NotificationOutlined, 
  MessageOutlined, 
  MenuUnfoldOutlined, 
  MenuFoldOutlined 
} from '@ant-design/icons';
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
  const { user, loading, signOut } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const userMenuItems = [
    {
      key: '1',
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

  const menuItems = React.useMemo(() => {
    const items = [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/dashboard'),
      }
    ];

    const role = user?.user_rol;

    if (role === 'dev') {
      items.push(
        {
          key: 'real-estate',
          icon: <HomeOutlined />,
          label: 'Inmobiliarias',
          onClick: () => navigate('/dev/real-estate'),
        },
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'Usuarios',
          onClick: () => navigate('/dev/users'),
        },
        {
          key: 'projects',
          icon: <ProjectOutlined />,
          label: 'Proyectos',
          onClick: () => navigate('/dev/projects'),
        }
      );
    } else if (role === 'admin') {
      items.push(
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'Vendedores',
          onClick: () => navigate('/admin/users'),
        },
        {
          key: 'prospects',
          icon: <ContactsOutlined />,
          label: 'Prospectos',
          onClick: () => navigate('/admin/prospects'),
        },
        {
          key: 'projects',
          icon: <ProjectOutlined />,
          label: 'Proyectos',
          onClick: () => navigate('/admin/projects'),
        },
        {
          key: 'push-campaigns',
          icon: <NotificationOutlined />,
          label: 'Campañas Push',
          onClick: () => navigate('/admin/push-campaigns'),
        },
        {
          key: 'chat',
          icon: <MessageOutlined />,
          label: 'Chat',
          onClick: () => navigate('/admin/chat'),
        },
        {
          key: 'inmobiliaria',
          icon: <HomeOutlined />,
          label: 'Inmobiliaria',
          onClick: () => navigate('/admin/inmobiliaria'),
        }
      );
    }

    // Agregar enlaces de perfil y configuración al final del menú
    items.push(
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Perfil',
        onClick: () => navigate('/profile'),
      }
    );

    return items;
  }, [navigate, user?.user_rol]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: colorBgContainer 
      }}>
        <Spin size="large">
          <div style={{ padding: '50px' }}>Cargando...</div>
        </Spin>
      </div>
    );
  }

  return (
    <Layout id="components-layout-demo-custom-trigger" style={{ minHeight: '100vh', height: '100%' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ minHeight: '100vh' }}>
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
      <Layout className="site-layout" style={{ minHeight: '100vh' }}>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger"
          />
          <Space style={{ float: 'right', marginRight: 24 }}>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: user?.user_metadata?.avatar_url ? 'transparent' : '#1890ff',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
                <Text strong>
                  {user?.nombre ?? 'Usuario'}
                  {user?.user_rol ? ` (${user.user_rol})` : ''}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 'calc(100vh - 112px)', // 64px header + 24px margin top + 24px margin bottom
            borderRadius: borderRadiusLG,
            flex: 1
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
