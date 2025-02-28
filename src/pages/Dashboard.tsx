import { Card, Row, Col, Typography, Spin, Grid, Space, theme } from 'antd';
import { UserOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

export const Dashboard = () => {
  const { user, loading, inmobiliariaName, role } = useAuth();
  const screens = useBreakpoint();
  const { token } = useToken();

  if (loading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}>
        <Space direction="vertical" align="center">
          <Spin size={screens.xs ? "default" : "large"} />
          <Typography.Text>Cargando dashboard...</Typography.Text>
        </Space>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100%' }}>
      <Space direction="vertical" size={screens.xs ? "small" : "middle"} style={{ width: '100%', marginBottom: token.marginMD }}>
        <Title level={screens.xs ? 3 : 2} style={{ margin: 0 }}>
          {`Bienvenido, ${user?.nombre || 'Usuario'}`}
        </Title>
        {inmobiliariaName && (
          <Title level={screens.xs ? 5 : 4} style={{ margin: 0 }}>
            {inmobiliariaName}
          </Title>
        )}
      </Space>
      <Row gutter={[screens.xs ? 8 : 16, screens.xs ? 8 : 16]} style={{ width: '100%', margin: 0 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            size={screens.xs ? "small" : "default"}
            style={{ height: '100%' }}
          >
            <Card.Meta
              avatar={<UserOutlined style={{ fontSize: screens.xs ? 20 : 24, color: '#1890ff' }} />}
              title={<Typography.Text strong>Mi Perfil</Typography.Text>}
              description={`Rol: ${role || 'No especificado'}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            size={screens.xs ? "small" : "default"}
            style={{ height: '100%' }}
          >
            <Card.Meta
              avatar={<ShopOutlined style={{ fontSize: screens.xs ? 20 : 24, color: '#52c41a' }} />}
              title={<Typography.Text strong>Inmobiliaria</Typography.Text>}
              description={inmobiliariaName || 'No asignada'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            size={screens.xs ? "small" : "default"}
            style={{ height: '100%' }}
          >
            <Card.Meta
              avatar={<TeamOutlined style={{ fontSize: screens.xs ? 20 : 24, color: '#722ed1' }} />}
              title={<Typography.Text strong>Estado</Typography.Text>}
              description={user?.activo ? 'Activo' : 'Inactivo'}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};