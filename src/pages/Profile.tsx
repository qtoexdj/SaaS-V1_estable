import React, { useState } from 'react';
import {
  Card,
  Avatar,
  Descriptions,
  Typography,
  Row,
  Col,
  Upload,
  message,
  Button,
  Menu,
  Space
} from 'antd';
import {
UserOutlined,
UploadOutlined,
BellOutlined,
CreditCardOutlined,
LockOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { uploadAvatar, deleteAvatar } from '../services/avatar';
import type { RcFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
const { user } = useAuth();
const [loading, setLoading] = useState(false);
const [avatarUrl, setAvatarUrl] = useState<string | null>(
user?.user_metadata?.avatar_url || null
);
const [selectedMenu, setSelectedMenu] = useState('personal-info');

if (!user) {
return null;
}

const handleUpload = async (file: RcFile): Promise<boolean> => {
try {
setLoading(true);
const { publicUrl } = await uploadAvatar(file, user.id);
setAvatarUrl(publicUrl);
message.success('Avatar actualizado exitosamente');
return false; // prevent default upload behavior
} catch (error) {
message.error(error instanceof Error ? error.message : 'Error al subir el avatar');
return false;
} finally {
setLoading(false);
}
};

const handleRemoveAvatar = async () => {
if (!avatarUrl) return;

try {
setLoading(true);
await deleteAvatar(user.id, avatarUrl);
setAvatarUrl(null);
message.success('Avatar eliminado exitosamente');
} catch (error) {
message.error('Error al eliminar el avatar');
} finally {
setLoading(false);
}
};

const menuItems = [
{ key: 'personal-info', icon: <UserOutlined />, label: 'Información Personal' },
{ key: 'security', icon: <LockOutlined />, label: 'Seguridad' },
{ key: 'notifications', icon: <BellOutlined />, label: 'Notificaciones' },
{ key: 'payments', icon: <CreditCardOutlined />, label: 'Pagos' },
];

const renderContent = () => {
switch (selectedMenu) {
case 'personal-info':
return (
<Card
  title="Información Personal"
  style={{
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  }}
>
  <Descriptions
    layout="vertical"
    column={2}
    style={{
      padding: '8px',
      background: '#fafafa',
      borderRadius: '8px'
    }}
  >
    <Descriptions.Item
      label={<Text style={{ fontSize: '14px', color: '#666' }}>Nombre</Text>}
      contentStyle={{ fontWeight: 500 }}
    >
      {user.nombre}
    </Descriptions.Item>
    <Descriptions.Item
      label={<Text style={{ fontSize: '14px', color: '#666' }}>Email</Text>}
      contentStyle={{ fontWeight: 500 }}
    >
      {user.email}
    </Descriptions.Item>
    <Descriptions.Item
      label={<Text style={{ fontSize: '14px', color: '#666' }}>Rol</Text>}
      contentStyle={{ fontWeight: 500 }}
    >
      {user.app_metadata?.user_rol}
    </Descriptions.Item>
    {user.app_metadata?.inmobiliaria_id && (
      <Descriptions.Item
        label={<Text style={{ fontSize: '14px', color: '#666' }}>Inmobiliaria ID</Text>}
        contentStyle={{ fontWeight: 500 }}
      >
        {user.app_metadata.inmobiliaria_id}
      </Descriptions.Item>
    )}
  </Descriptions>
</Card>
);
case 'security':
return (
  <Card
    title="Seguridad"
    style={{
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}
  >
    Contenido de seguridad
  </Card>
);
case 'notifications':
return (
  <Card
    title="Notificaciones"
    style={{
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}
  >
    Contenido de notificaciones
  </Card>
);
case 'payments':
return (
  <Card
    title="Pagos"
    style={{
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}
  >
    Contenido de pagos
  </Card>
);
default:
return null;
}
};

return (
  <div style={{ padding: '0px' }}>
    <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>Perfil de Usuario</Title>
    <Row gutter={24}>
      <Col xs={24} sm={24} md={8} lg={7} xl={6}>
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Avatar
              size={140}
              icon={<UserOutlined />}
              src={avatarUrl}
              style={{
                marginBottom: '24px',
                border: '4px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>{user.nombre}</Title>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
              {user.email}
            </Typography.Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                showUploadList={false}
                beforeUpload={handleUpload}
                accept="image/*"
                maxCount={1}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={loading}
                  style={{
                    width: '100%',
                    height: '36px',
                    borderRadius: '6px'
                  }}
                >
                  Cambiar Avatar
                </Button>
              </Upload>
              {avatarUrl && (
                <Button
                  type="text"
                  danger
                  onClick={handleRemoveAvatar}
                  loading={loading}
                  style={{
                    width: '100%',
                    height: '36px',
                    borderRadius: '6px'
                  }}
                >
                  Quitar Avatar
                </Button>
              )}
            </Space>
          </div>
        </Card>
        <Menu
          mode="inline"
          defaultSelectedKeys={['personal-info']}
          selectedKeys={[selectedMenu]}
          onSelect={(e) => setSelectedMenu(e.key)}
          items={menuItems}
          style={{
            borderRadius: '12px',
            padding: '8px',
            background: '#f5f5f5'
          }}
        />
      </Col>
      <Col xs={24} sm={24} md={16} lg={17} xl={18}>
        {renderContent()}
      </Col>
    </Row>
  </div>
);
};

export default Profile;