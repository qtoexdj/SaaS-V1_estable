import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Avatar,
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Tag,
  Tooltip,
  Badge,
  App,
  Popconfirm,
  Spin,
  Divider,
  Empty
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
const { Title, Text } = Typography;

interface User {
  id: string;
  email: string;
  nombre: string;
  avatar_url: string | null;
  user_rol: string;
  inmobiliaria_id: string;
  telefono: string;
  activo: boolean;
  created_at: string;
  ventas_totales?: number;
  prospectos_activos?: number;
  tasa_conversion?: number;
  ultimo_login?: string;
}

interface Stats {
  totalVendedores: number;
  vendedoresActivos: number;
  promedioConversion: number;
  ventasTotales: number;
}

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { message: messageApi } = App.useApp();
  const [stats, setStats] = useState<Stats>({
    totalVendedores: 0,
    vendedoresActivos: 0,
    promedioConversion: 0,
    ventasTotales: 0
  });

  const fetchUsers = async () => {
    try {
      if (!user?.inmobiliaria_id) {
        messageApi.error('No se encontró la inmobiliaria');
        setLoading(false);
        return;
      }

      // Obtener usuarios
      const { data: usuarios, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('inmobiliaria_id', user.inmobiliaria_id);

      if (userError) {
        console.error('Error fetching users:', userError);
        throw userError;
      }

      // Procesar usuarios y sus datos
      const formattedUsers = await Promise.all((usuarios || []).map(async userItem => {
        try {
          // Mantener el avatar_url existente
          const avatarUrl = userItem.avatar_url;
          if (avatarUrl) {
            console.log(`Avatar URL para usuario ${userItem.id}:`, avatarUrl);
          }

          // Obtener prospectos

          // Obtener conteo de prospectos
          const { count } = await supabase
            .from('prospectos')
            .select('*', { count: 'exact', head: true })
            .eq('vendedor_id', userItem.id)
            .eq('inmobiliaria_id', user.inmobiliaria_id);

          // Construir usuario formateado
          return {
            ...userItem,
            avatar_url: avatarUrl,
            ventas_totales: count || 0,
            prospectos_activos: 0, // TODO: Implementar lógica para prospectos activos
            tasa_conversion: 0, // TODO: Implementar cálculo de tasa de conversión
            ultimo_login: null // TODO: Implementar tracking de último login
          };
        } catch (error) {
          console.error(`Error procesando usuario ${userItem.id}:`, error);
          // En caso de error, retornar usuario con valores por defecto
          return {
            ...userItem,
            avatar_url: null,
            ventas_totales: 0,
            prospectos_activos: 0,
            tasa_conversion: 0,
            ultimo_login: null
          };
        }
      }));

      console.log(`Procesados ${formattedUsers.length} usuarios`);

      setUsers(formattedUsers);
      calculateStats(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      messageApi.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user, messageApi]);

  const calculateStats = (usersData: User[]) => {
    const activos = usersData.filter(u => u.activo).length;
    const totalVentas = usersData.reduce((acc, u) => acc + (u.ventas_totales || 0), 0);
    const promConversion = usersData.length > 0
      ? usersData.reduce((acc, u) => acc + (u.tasa_conversion || 0), 0) / usersData.length
      : 0;

    setStats({
      totalVendedores: usersData.length,
      vendedoresActivos: activos,
      promedioConversion: promConversion,
      ventasTotales: totalVentas
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!user?.inmobiliaria_id) {
        messageApi.error('No se encontró la inmobiliaria');
        return;
      }

      const userData = {
        email: values.email,
        nombre: values.nombre,
        telefono: values.telefono,
        user_rol: values.user_rol,
        activo: values.activo,
        inmobiliaria_id: user.inmobiliaria_id
      };

      if (editingUser) {
        const { error } = await supabase
          .from('usuarios')
          .update(userData)
          .eq('id', editingUser.id)
          .eq('inmobiliaria_id', user.inmobiliaria_id);

        if (error) throw error;
        messageApi.success('Usuario actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('usuarios')
          .insert([userData]);

        if (error) throw error;
        messageApi.success('Usuario creado exitosamente');
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      messageApi.error('Error al guardar usuario');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      if (!user?.inmobiliaria_id) {
        messageApi.error('No se encontró la inmobiliaria');
        return;
      }

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId)
        .eq('inmobiliaria_id', user.inmobiliaria_id);

      if (error) throw error;
      messageApi.success('Usuario eliminado exitosamente');
      setUsers(users.filter(u => u.id !== userId));
      calculateStats(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      messageApi.error('Error al eliminar usuario');
    }
  };

  return (
    <Layout.Content style={{ padding: 0 }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>Vendedores</Title>
      
      {/* Dashboard Stats */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title="Total Vendedores"
              value={stats.totalVendedores}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title="Vendedores Activos"
              value={stats.vendedoresActivos}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title="Promedio Conversión"
              value={stats.promedioConversion}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title="Ventas Totales"
              value={stats.ventasTotales}
              prefix={<TrophyOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Controls */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Nuevo Vendedor
        </Button>
      </div>

      {/* Lista de Vendedores */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : users.length === 0 ? (
        <Empty description="No hay vendedores registrados" />
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={users}
          renderItem={(item) => (
            <List.Item>
              <Badge.Ribbon
                text={item.activo ? 'Activo' : 'Inactivo'}
                color={item.activo ? 'green' : 'default'}
              >
                <Card
                  hoverable
                  styles={{
                    body: { padding: '24px', height: '100%' }
                  }}
                  actions={[
                    <Tooltip title="Editar" key="edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingUser(item);
                          form.setFieldsValue(item);
                          setModalVisible(true);
                        }}
                      />
                    </Tooltip>,
                    <Tooltip title="Ver Detalles" key="details">
                      <Button
                        type="text"
                        icon={<UserOutlined />}
                        onClick={() => setSelectedUser(item)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="¿Eliminar usuario?"
                      description="Esta acción no se puede deshacer"
                      onConfirm={() => handleDelete(item.id)}
                      okText="Sí"
                      cancelText="No"
                      key="delete"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ]}
                >
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Avatar
                      size={100}
                      src={item.avatar_url}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: item.avatar_url ? 'transparent' : '#1890ff',
                        border: '4px solid #f0f0f0'
                      }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Text strong style={{ fontSize: '16px', display: 'block' }}>
                        {item.nombre}
                      </Text>
                      <Tag color={item.user_rol === 'vende' ? 'blue' : 'purple'} style={{ marginTop: 8 }}>
                        {item.user_rol === 'vende' ? 'Vendedor' : 'Administrador'}
                      </Tag>
                    </div>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MailOutlined style={{ color: '#1890ff' }} />
                      <Text ellipsis style={{ flex: 1 }}>{item.email}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PhoneOutlined style={{ color: '#52c41a' }} />
                      <Text>{item.telefono}</Text>
                    </div>
                  </Space>

                  <Divider style={{ margin: '16px 0' }} />

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title={<Text type="secondary" style={{ fontSize: '12px' }}>Ventas</Text>}
                        value={item.ventas_totales || 0}
                        prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                        valueStyle={{ fontSize: '16px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={<Text type="secondary" style={{ fontSize: '12px' }}>Prospectos</Text>}
                        value={item.prospectos_activos || 0}
                        prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                        valueStyle={{ fontSize: '16px' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Badge.Ribbon>
            </List.Item>
          )}
        />
      )}

      {/* Modal de Edición/Creación */}
      <Modal
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ user_rol: 'vende', activo: true }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Por favor ingrese un email válido' }
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Teléfono"
            rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            name="user_rol"
            label="Rol"
            rules={[{ required: true, message: 'Por favor seleccione el rol' }]}
          >
            <Select>
              <Select.Option value="vende">Vendedor</Select.Option>
              <Select.Option value="admin">Administrador</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="activo"
            label="Estado"
          >
            <Select>
              <Select.Option value={true}>Activo</Select.Option>
              <Select.Option value={false}>Inactivo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingUser(null);
                form.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Guardar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Detalles */}
      <Modal
        title="Detalles del Usuario"
        open={!!selectedUser}
        onCancel={() => setSelectedUser(null)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div>
            <div style={{
              textAlign: 'center',
              padding: '24px',
              background: 'linear-gradient(to bottom, #1890ff11 0%, transparent 100%)',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <Avatar
                size={150}
                src={selectedUser.avatar_url}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: selectedUser.avatar_url ? 'transparent' : '#1890ff',
                  border: '6px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Title level={3} style={{ margin: '16px 0 4px' }}>{selectedUser.nombre}</Title>
              <Tag color={selectedUser.user_rol === 'vende' ? 'blue' : 'purple'} style={{ padding: '4px 12px' }}>
                {selectedUser.user_rol === 'vende' ? 'Vendedor' : 'Administrador'}
              </Tag>
              {selectedUser.activo ? (
                <Tag color="success" style={{ marginLeft: '8px', padding: '4px 12px' }}>
                  <CheckCircleOutlined /> Activo
                </Tag>
              ) : (
                <Tag color="default" style={{ marginLeft: '8px', padding: '4px 12px' }}>
                  Inactivo
                </Tag>
              )}
            </div>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card size="small" bordered={false} style={{ background: '#f6ffed' }}>
                  <Statistic
                    title={<Text strong style={{ color: '#389e0d' }}>Ventas Totales</Text>}
                    value={selectedUser.ventas_totales || 0}
                    prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#389e0d' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" bordered={false} style={{ background: '#e6f7ff' }}>
                  <Statistic
                    title={<Text strong style={{ color: '#096dd9' }}>Prospectos Activos</Text>}
                    value={selectedUser.prospectos_activos || 0}
                    prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#096dd9' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" bordered={false} style={{ background: '#fff7e6' }}>
                  <Statistic
                    title={<Text strong style={{ color: '#d46b08' }}>Tasa de Conversión</Text>}
                    value={selectedUser.tasa_conversion || 0}
                    precision={1}
                    suffix="%"
                    prefix={<RiseOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#d46b08' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" bordered={false} style={{ background: '#f0f5ff' }}>
                  <Statistic
                    title={<Text strong style={{ color: '#1d39c4' }}>Último Acceso</Text>}
                    value={selectedUser.ultimo_login ? new Date(selectedUser.ultimo_login).toLocaleDateString() : 'N/A'}
                    prefix={<ClockCircleOutlined style={{ color: '#2f54eb' }} />}
                    valueStyle={{ color: '#1d39c4' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              style={{ marginTop: '24px' }}
              bordered={false}
              size="small"
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MailOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                  <div>
                    <Text type="secondary">Email</Text>
                    <Text strong style={{ display: 'block' }}>{selectedUser.email}</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <PhoneOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                  <div>
                    <Text type="secondary">Teléfono</Text>
                    <Text strong style={{ display: 'block' }}>{selectedUser.telefono}</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </Layout.Content>
  );
};

export { UsersAdmin };
export default UsersAdmin;