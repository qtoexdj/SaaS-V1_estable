import { FC, useEffect, useState } from 'react';
import { Table, message, Button, Modal, Form, Input, Switch, Space, Tag, Select, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';

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

  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
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
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
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
        </Space>
      ),
    },
  ];

  const fetchUsers = async () => {
    try {
      // Primero obtenemos el inmobiliaria_id del usuario actual
      const { data: userDetails, error: userError } = await supabase
        .from('usuarios')
        .select('inmobiliaria_id')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      // Luego obtenemos todos los usuarios que comparten el mismo inmobiliaria_id
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
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1>Usuarios de la Inmobiliaria</h1>
      </div>

      <Table<User>
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} usuarios`,
        }}
      />

      <Modal
        title="Editar Usuario"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ activo: true }}
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