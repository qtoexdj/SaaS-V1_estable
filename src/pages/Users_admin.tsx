import { FC, useEffect, useState } from 'react';
import { Table, message, Button, Modal, Form, Input, Switch, Space, Tag, Select, Popconfirm, theme, Typography, Grid } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';

const { Title } = Typography;

interface User {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  user_rol: 'admin' | 'vende';
  inmobiliaria_id: string | null;
  activo: boolean;
  created_at: string;
}

export const UsersAdmin: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getResponsiveColumns = () => {
    const baseColumns = columns.filter(column => {
      if (screens.xs) {
        // En móviles solo mostrar nombre, estado y acciones
        return ['nombre', 'activo', 'actions'].includes(column.key as string);
      }
      if (screens.sm) {
        // En tablets agregar email y rol
        return ['nombre', 'email', 'user_rol', 'activo', 'actions'].includes(column.key as string);
      }
      // En desktop mostrar todas las columnas
      return true;
    });

    return baseColumns;
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase.rpc('delete_user_completely', {
        target_user_id: id
      });

      if (error) throw error;

      message.success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      message.error('Error al eliminar usuario. Solo los desarrolladores pueden eliminar usuarios.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (record: User) => {
    setEditingRecord(record);
    form.setFieldsValue({
      email: record.email,
      nombre: record.nombre,
      telefono: record.telefono,
      activo: record.activo,
      user_rol: record.user_rol,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!editingRecord) return;

      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: values.nombre,
          telefono: values.telefono,
          activo: values.activo,
          user_rol: values.user_rol,
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      message.success('Usuario actualizado correctamente');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      message.error(error.message);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      ellipsis: true,
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      ellipsis: true,
    },
    {
      title: 'Rol',
      dataIndex: 'user_rol',
      key: 'user_rol',
      render: (rol: string) => {
        const roles = {
          admin: 'Admin',
          vende: 'Vendedor',
        };
        return roles[rol as keyof typeof roles] || rol;
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Vendedor', value: 'vende' },
      ],
      onFilter: (value, record) => record.user_rol === value,
      width: 120,
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Tag color={activo ? 'green' : 'red'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value, record) => record.activo === value,
      width: 100,
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      width: 150,
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          {screens.xs ? (
            // Versión compacta para móviles
            <>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
              <Popconfirm
                title="Eliminar Usuario"
                description="¿Estás seguro?"
                onConfirm={() => handleDelete(record.id)}
                okText="Sí"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deletingId === record.id}
                />
              </Popconfirm>
            </>
          ) : (
            // Versión completa para tablets y desktop
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Editar
              </Button>
              <Popconfirm
                title="Eliminar Usuario"
                description="¿Estás seguro de que quieres eliminar este usuario?"
                onConfirm={() => handleDelete(record.id)}
                okText="Sí"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deletingId === record.id}
                >
                  Eliminar
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const fetchUsers = async () => {
    try {
      const { data: userDetails, error: userError } = await supabase
        .from('usuarios')
        .select('inmobiliaria_id')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .in('user_rol', ['admin', 'vende'])
        .eq('inmobiliaria_id', userDetails.inmobiliaria_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.app_metadata?.inmobiliaria_id) {
      fetchUsers();
    }
  }, [user?.app_metadata?.inmobiliaria_id]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      gap: token.padding 
    }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: token.marginLG 
      }}>
        <Title
          level={screens.xs ? 5 : 4}
          style={{
            margin: 0,
            fontSize: screens.xs ? '16px' : undefined
          }}
        >
          <Space size={screens.xs ? 'small' : 'middle'}>
            <UserOutlined />
            {screens.xs ? 'Usuarios' : 'Usuarios de la Inmobiliaria'}
          </Space>
        </Title>
      </div>

      <Table<User>
        columns={getResponsiveColumns()}
        dataSource={users}
        rowKey="id"
        loading={loading}
        scroll={{
          x: screens.xs ? 400 : screens.sm ? 800 : 1000,
          y: 'calc(100vh - 280px)'
        }}
        pagination={{
          pageSize: screens.xs ? 5 : 10,
          showSizeChanger: !screens.xs,
          ...(screens.xs ? {} : {
            showTotal: (total) => `Total: ${total} usuarios`
          }),
          position: ['bottomCenter'],
          showQuickJumper: !screens.xs,
          size: screens.xs ? 'small' : 'default'
        }}
        style={{
          flex: 1,
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
        }}
        size={screens.xs ? 'small' : 'middle'}
      />

      <Modal
        title="Editar Usuario"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        destroyOnClose
        width={screens.xs ? '95%' : screens.sm ? '80%' : 600}
        style={{ top: screens.xs ? 0 : 100 }}
        centered={!screens.xs}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ activo: true }}
          size={screens.xs ? "middle" : "large"}
          style={{
            padding: screens.xs ? '8px 0' : '16px 0'
          }}
        >
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="telefono"
            label="Teléfono"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="user_rol"
            label="Rol"
            rules={[{ required: true, message: 'Por favor seleccione el rol' }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="vende">Vendedor</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="activo"
            label="Estado"
            valuePropName="checked"
          >
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};