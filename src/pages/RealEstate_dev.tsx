import { FC, useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';

interface RealEstate {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface RealEstateFormData {
  nombre: string;
  activo: boolean;
}

export const RealEstate_dev: FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RealEstate[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RealEstate | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  const handleCreate = async (values: RealEstateFormData) => {
    try {
      const { error } = await supabase
        .from('inmobiliarias')
        .insert([{
          nombre: values.nombre,
          activo: values.activo,
        }]);

      if (error) throw error;

      message.success('Inmobiliaria creada correctamente');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchRealEstates();
    } catch (error) {
      console.error('Error al crear inmobiliaria:', error);
      message.error('Error al crear inmobiliaria');
    }
  };

  const handleEdit = (record: RealEstate) => {
    setEditingRecord(record);
    form.setFieldsValue({
      nombre: record.nombre,
      activo: record.activo,
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inmobiliarias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      message.success('Inmobiliaria eliminada correctamente');
      fetchRealEstates();
    } catch (error) {
      console.error('Error al eliminar inmobiliaria:', error);
      message.error('Error al eliminar inmobiliaria');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!editingRecord) return;

      const { error } = await supabase
        .from('inmobiliarias')
        .update({
          nombre: values.nombre,
          activo: values.activo,
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      message.success('Inmobiliaria actualizada correctamente');
      setEditModalVisible(false);
      fetchRealEstates();
    } catch (error) {
      console.error('Error al actualizar inmobiliaria:', error);
      message.error('Error al actualizar inmobiliaria');
    }
  };

  const columns: ColumnsType<RealEstate> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
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
      title: 'Última Actualización',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a, b) => 
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
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
            title="Eliminar Inmobiliaria"
            description="¿Estás seguro de que quieres eliminar esta inmobiliaria?"
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

  const fetchRealEstates = async () => {
    try {
      const { data, error } = await supabase
        .from('inmobiliarias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(data);
    } catch (error) {
      console.error('Error al cargar inmobiliarias:', error);
      message.error('Error al cargar inmobiliarias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealEstates();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Inmobiliarias</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Nueva Inmobiliaria
        </Button>
      </div>

      <Table<RealEstate>
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} inmobiliarias`,
        }}
      />

      <Modal
        title="Nueva Inmobiliaria"
        open={createModalVisible}
        onOk={() => createForm.submit()}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
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
            name="activo"
            label="Estado"
            valuePropName="checked"
          >
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Editar Inmobiliaria"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        destroyOnClose
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