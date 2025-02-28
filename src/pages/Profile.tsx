import React, { useState } from 'react';
import { Card, Avatar, Descriptions, Typography, Row, Col, Upload, message, Button } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { uploadAvatar, deleteAvatar } from '../services/avatar';
import type { RcFile } from 'antd/es/upload/interface';

const { Title } = Typography;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );

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

  return (
    <div>
      <Title level={2}>Perfil de Usuario</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                icon={<UserOutlined />} 
                src={avatarUrl}
                style={{ marginBottom: '20px' }}
              />
              <Title level={4}>{user.nombre}</Title>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
                {user.email}
              </Typography.Text>
              <Upload
                showUploadList={false}
                beforeUpload={handleUpload}
                accept="image/*"
                maxCount={1}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={loading}
                  style={{ marginBottom: '10px', width: '100%' }}
                >
                  Subir Avatar
                </Button>
              </Upload>
              {avatarUrl && (
                <Button 
                  danger 
                  onClick={handleRemoveAvatar}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Eliminar Avatar
                </Button>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={16}>
          <Card title="Información Personal">
            <Descriptions layout="vertical">
              <Descriptions.Item label="Nombre">{user.nombre}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Rol">{user.app_metadata?.user_rol}</Descriptions.Item>
              {user.app_metadata?.inmobiliaria_id && (
                <Descriptions.Item label="Inmobiliaria ID">{user.app_metadata.inmobiliaria_id}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;