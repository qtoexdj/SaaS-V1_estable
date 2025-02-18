import { Card, Row, Col, Typography } from 'antd';
import { UserOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const Dashboard = () => {
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Card.Meta
              avatar={<UserOutlined style={{ fontSize: 24 }} />}
              title="Perfil"
              description="Gestiona tu información personal"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Card.Meta
              avatar={<ShopOutlined style={{ fontSize: 24 }} />}
              title="Productos"
              description="Administra tus productos"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Card.Meta
              avatar={<TeamOutlined style={{ fontSize: 24 }} />}
              title="Usuarios"
              description="Gestiona los usuarios del sistema"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};