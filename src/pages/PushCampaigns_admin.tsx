import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, List, Space, Button, Modal, Form, Input, Select, Tag, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';
import TextArea from 'antd/es/input/TextArea';

interface PushCampaign {
  id: string;
  nombre: string;
  descripcion: string;
  mensaje: string;
  caracteristicas: any;
  filtros: any;
  created_at: string;
}

const PushCampaigns_admin: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCampaign, setEditingCampaign] = useState<PushCampaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campanas_push')
        .select('*')
        .eq('inmobiliaria_id', user?.app_metadata?.inmobiliaria_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.app_metadata?.inmobiliaria_id) {
      fetchCampaigns();
    }
  }, [user?.app_metadata?.inmobiliaria_id]);

  const handleSubmit = async (values: any) => {
    try {
      // Asegurar que los campos JSON sean válidos o usar objetos vacíos
      const caracteristicas = values.caracteristicas ? JSON.parse(values.caracteristicas) : {};
      const filtros = values.filtros ? JSON.parse(values.filtros) : {};

      const campaign = {
        ...values,
        caracteristicas,
        filtros,
        inmobiliaria_id: user?.app_metadata?.inmobiliaria_id
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from('campanas_push')
          .update(campaign)
          .eq('id', editingCampaign.id);

        if (error) throw error;
        message.success('Campaña actualizada exitosamente');
      } else {
        const { error } = await supabase
          .from('campanas_push')
          .insert([campaign]);

        if (error) throw error;
        message.success('Campaña creada exitosamente');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      message.error(
        error.message === 'new row violates row-level security policy for table "campanas_push"'
          ? 'No tienes permisos para realizar esta acción'
          : 'Error al guardar la campaña'
      );
    }
  };

  const handleEdit = (campaign: PushCampaign) => {
    setEditingCampaign(campaign);
    form.setFieldsValue({
      ...campaign,
      caracteristicas: JSON.stringify(campaign.caracteristicas, null, 2),
      filtros: JSON.stringify(campaign.filtros, null, 2)
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta campaña?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('campanas_push')
            .delete()
            .eq('id', id);

          if (error) throw error;
          message.success('Campaña eliminada exitosamente');
          fetchCampaigns();
        } catch (error: any) {
          console.error('Error deleting campaign:', error);
          message.error(
            error.message === 'new row violates row-level security policy for table "campanas_push"'
              ? 'No tienes permisos para eliminar esta campaña'
              : 'Error al eliminar la campaña'
          );
        }
      },
    });
  };

  const filteredCampaigns = filterStatus
    ? campaigns.filter(campaign => 
        campaign.caracteristicas?.status === filterStatus
      )
    : campaigns;

  return (
    <div style={{ padding: '0px' }}>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>
        Campañas Push
      </Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Gestión de notificaciones push y campañas
      </Typography.Text>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCampaign(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Nueva Campaña
          </Button>
        </div>

        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Filtrar por estado"
            allowClear
            onChange={(value) => setFilterStatus(value)}
          >
            <Select.Option value="active">Activa</Select.Option>
            <Select.Option value="scheduled">Programada</Select.Option>
            <Select.Option value="completed">Completada</Select.Option>
            <Select.Option value="draft">Borrador</Select.Option>
          </Select>
        </Space>

        <List
          loading={loading}
          grid={{ gutter: 16, column: 3 }}
          dataSource={filteredCampaigns}
          renderItem={item => (
            <List.Item>
              <Card
                title={item.nombre}
                extra={
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(item)}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDelete(item.id)}
                    />
                  </Space>
                }
              >
                <p>{item.descripcion}</p>
                <Tag color={
                  item.caracteristicas?.status === 'active' ? 'green' :
                  item.caracteristicas?.status === 'scheduled' ? 'blue' :
                  item.caracteristicas?.status === 'completed' ? 'gray' :
                  'orange'
                }>
                  {item.caracteristicas?.status || 'draft'}
                </Tag>
                <p style={{ marginTop: 8 }}>{item.mensaje}</p>
              </Card>
            </List.Item>
          )}
        />

        <Modal
          title={editingCampaign ? 'Editar Campaña' : 'Nueva Campaña'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingCampaign(null);
          }}
          onOk={form.submit}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="descripcion"
              label="Descripción"
            >
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="mensaje"
              label="Mensaje"
              rules={[{ required: true, message: 'Por favor ingresa el mensaje' }]}
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="caracteristicas"
              label="Características"
              extra="Formato JSON. Ejemplo: { 'status': 'active' }"
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="filtros"
              label="Filtros"
              extra="Formato JSON. Ejemplo: { 'target': 'all' }"
            >
              <TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default PushCampaigns_admin;