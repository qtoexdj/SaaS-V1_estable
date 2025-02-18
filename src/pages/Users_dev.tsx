import { FC, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Table, message, Button, Modal, Form, Input, Switch, Select, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';

interface User {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  user_rol: 'dev' | 'admin' | 'vende';
  inmobiliaria_id: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  inmobiliaria?: {
    nombre: string;
  };
}

interface Inmobiliaria {
  id: string;
  nombre: string;
}

export const Users_dev: FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<User[]>([]);
  const [selectedInmobiliaria, setSelectedInmobiliaria] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<User | null>(null);
  const [inmobiliarias, setInmobiliarias] = useState<Inmobiliaria[]>([]);
  const [form] = Form.useForm();
  const { role } = useAuth();

  const handleCreateUser = async () => {
    try {
      if (role !== 'dev') {
        throw new Error('Solo los desarrolladores pueden crear nuevos usuarios.');
      }

      const values = await form.validateFields();

      // Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: 'password123', // TODO: Generar una contraseña aleatoria y enviarla por correo electrónico
        options: {
          data: {
            nombre: values.nombre,
            telefono: values.telefono,
            user_rol: values.user_rol,
            inmobiliaria_id: values.inmobiliaria_id,
            activo: values.activo,
          },
        },
      });

      if (authError) throw authError;

      // Crear usuario en la tabla usuarios
      const { error } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authData.user?.id,
            email: values.email,
            nombre: values.nombre,
            telefono: values.telefono,
            user_rol: values.user_rol,
            inmobiliaria_id: values.inmobiliaria_id,
            activo: values.activo,
          },
        ]);

      if (error) throw error;

      message.success('Usuario creado correctamente');
      setCreateUserModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      message.error(error.message);
    }
  };

  const fetchInmobiliarias = async () => {
    try {
      const { data, error } = await supabase
        .from('inmobiliarias')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      setInmobiliarias(data);
    } catch (error) {
      console.error('Error al cargar inmobiliarias:', error);
      message.error('Error al cargar inmobiliarias');
    }
  };

  const handleEdit = (record: User) => {
    setEditingRecord(record);
    form.setFieldsValue({
      email: record.email,
      nombre: record.nombre,
      telefono: record.telefono,
      user_rol: record.user_rol,
      inmobiliaria_id: record.inmobiliaria_id,
      activo: record.activo,
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.rpc('delete_user_completely', {
        target_user_id: id
      });

      if (error) throw error;

      message.success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      message.error('Error al eliminar usuario. Solo los desarrolladores pueden eliminar usuarios.');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!editingRecord) return;

      const { error } = await supabase
        .from('usuarios')
        .update({
          email: values.email,
          nombre: values.nombre,
          telefono: values.telefono,
          user_rol: values.user_rol,
          inmobiliaria_id: values.inmobiliaria_id,
          activo: values.activo,
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      message.success('Usuario actualizado correctamente');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      message.error('Error al actualizar usuario');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
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
      filters: [
        { text: 'Developer', value: 'dev' },
        { text: 'Admin', value: 'admin' },
        { text: 'Vendedor', value: 'vende' },
      ],
      onFilter: (value, record) => record.user_rol === value,
      render: (rol: string) => {
        const roles = {
          dev: 'Developer',
          admin: 'Admin',
          vende: 'Vendedor',
        };
        return roles[rol as keyof typeof roles] || rol;
      },
    },
    {
      title: 'Inmobiliaria',
      dataIndex: ['inmobiliaria', 'nombre'],
      key: 'inmobiliaria',
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <span style={{ color: activo ? '#52c41a' : '#ff4d4f' }}>
          {activo ? 'Activo' : 'Inactivo'}
        </span>
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
      render: (text: string) => new Date(text).toLocaleString(),
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
      let query = supabase
        .from('usuarios')
        .select(`
          *,
          inmobiliaria:inmobiliaria_id (
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedInmobiliaria) {
        query = query.eq('inmobiliaria_id', selectedInmobiliaria);
      }

      const { data, error } = await query;

      if (error) throw error;
      setData(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      message.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchInmobiliarias();
  }, [selectedInmobiliaria]);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Usuarios</h1>
        <Button type="primary" onClick={() => setCreateUserModalVisible(true)}>
          Nuevo Usuario
        </Button>
      </div>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Filtrar por Inmobiliaria</h3>
        <Select
          placeholder="Seleccione una Inmobiliaria"
          style={{ width: 200 }}
          onChange={(value) => setSelectedInmobiliaria(value)}
          allowClear
        >
          {inmobiliarias.map((inmobiliaria) => (
            <Select.Option key={inmobiliaria.id} value={inmobiliaria.id}>
              {inmobiliaria.nombre}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Modal
        title="Crear Nuevo Usuario"
        open={createUserModalVisible}
        onCancel={() => setCreateUserModalVisible(false)}
        onOk={handleCreateUser}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ activo: true }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Por favor ingrese un email válido' }
            ]}
          >
            <Input />
          </Form.Item>
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
              <Select.Option value="dev">Developer</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="vende">Vendedor</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="inmobiliaria_id"
            label="Inmobiliaria"
          >
            <Select allowClear>
              {inmobiliarias.map(inmobiliaria => (
                <Select.Option key={inmobiliaria.id} value={inmobiliaria.id}>
                  {inmobiliaria.nombre}
                </Select.Option>
              ))}
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

      <Table<User>
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Por favor ingrese un email válido' }
            ]}
          >
            <Input />
          </Form.Item>
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
              <Select.Option value="dev">Developer</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="vende">Vendedor</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="inmobiliaria_id"
            label="Inmobiliaria"
          >
            <Select allowClear>
              {inmobiliarias.map(inmobiliaria => (
                <Select.Option key={inmobiliaria.id} value={inmobiliaria.id}>
                  {inmobiliaria.nombre}
                </Select.Option>
              ))}
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