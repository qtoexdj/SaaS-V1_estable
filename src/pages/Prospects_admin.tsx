import React, { useState, useEffect } from 'react';
import { PageHeader } from '@ant-design/pro-layout';
import { List, Card, Tag, Input, Select, Space, Button, Modal, Form, DatePicker, Row, Col, Typography, Divider, Grid } from 'antd';
import { supabase } from '../config/supabase';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;
const { useBreakpoint } = Grid;

interface Prospect {
  id: string;
  nombre: string;
  etapa: string;
  numero_whatsapp: string;
  proyecto_interesado: string;
  fecha_proximo_seguimiento: string;
  cantidad_seguimientos: number;
}

const etapas = [
  { label: 'Nuevo prospecto', value: 'Nuevo prospecto', color: 'green' },
  { label: 'Conversación', value: 'Conversación', color: 'orange' },
  { label: 'Calificado', value: 'Calificado', color: 'blue' },
  { label: 'No calificado', value: 'No calificado', color: 'red' },
  { label: 'Agendado', value: 'Agendado', color: 'purple' },
  { label: 'No interesado', value: 'No interesado', color: 'gray' },
];

const getTagColor = (etapa: string) => {
  const found = etapas.find(e => e.value === etapa);
  return found ? found.color : 'default';
};

const Prospects_admin: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; nombre: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [etapaFilter, setEtapaFilter] = useState<string>('');
  const [proyectoFilter, setProyectoFilter] = useState<string>('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const fetchProjects = async () => {
    try {
      // Obtener el usuario actual para acceder a su inmobiliaria_id
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!userData?.user?.app_metadata?.inmobiliaria_id) {
        console.error('No se encontró el ID de la inmobiliaria del usuario');
        setLoadingProjects(false);
        return;
      }
      
      const inmobiliariaId = userData.user.app_metadata.inmobiliaria_id;
      
      // Filtrar por inmobiliaria_id para cumplir con las políticas RLS
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, nombre')
        .eq('inmobiliaria_id', inmobiliariaId);

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProspects = async () => {
    try {
      // Obtener el usuario actual para acceder a su inmobiliaria_id
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!userData?.user?.app_metadata?.inmobiliaria_id) {
        console.error('No se encontró el ID de la inmobiliaria del usuario');
        setLoading(false);
        return;
      }
      
      const inmobiliariaId = userData.user.app_metadata.inmobiliaria_id;
      
      // Filtrar por inmobiliaria_id para cumplir con las políticas RLS
      const { data, error } = await supabase
        .from('prospectos')
        .select('*')
        .eq('inmobiliaria_id', inmobiliariaId);

      if (error) throw error;

      setProspects(data || []);
    } catch (error) {
      console.error('Error fetching prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
    fetchProjects();
  }, []);

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      prospect.numero_whatsapp.includes(searchText);
    const matchesEtapa = !etapaFilter || prospect.etapa === etapaFilter;
    const matchesProyecto = !proyectoFilter || prospect.proyecto_interesado === proyectoFilter;
    return matchesSearch && matchesEtapa && matchesProyecto;
  });

  const handleEdit = async (values: any) => {
    if (!selectedProspect) return;

    try {
      // Obtener el usuario actual para acceder a su inmobiliaria_id
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!userData?.user?.app_metadata?.inmobiliaria_id) {
        console.error('No se encontró el ID de la inmobiliaria del usuario');
        return;
      }
      
      const inmobiliariaId = userData.user.app_metadata.inmobiliaria_id;

      const { error } = await supabase
        .from('prospectos')
        .update({
          nombre: values.nombre,
          etapa: values.etapa,
          proyecto_interesado: values.proyecto_interesado,
          fecha_proximo_seguimiento: values.fecha_proximo_seguimiento.toISOString(),
        })
        .eq('id', selectedProspect.id)
        .eq('inmobiliaria_id', inmobiliariaId); // Filtrar por inmobiliaria_id para cumplir con las políticas RLS

      if (error) throw error;

      fetchProspects();
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating prospect:', error);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este prospecto?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // Obtener el usuario actual para acceder a su inmobiliaria_id
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) throw userError;
          
          if (!userData?.user?.app_metadata?.inmobiliaria_id) {
            console.error('No se encontró el ID de la inmobiliaria del usuario');
            return;
          }
          
          const inmobiliariaId = userData.user.app_metadata.inmobiliaria_id;

          const { error } = await supabase
            .from('prospectos')
            .delete()
            .eq('id', id)
            .eq('inmobiliaria_id', inmobiliariaId); // Filtrar por inmobiliaria_id para cumplir con las políticas RLS

          if (error) throw error;

          fetchProspects();
        } catch (error) {
          console.error('Error deleting prospect:', error);
        }
      },
    });
  };

  return (
    <div style={{ padding: screens.xs ? '12px' : '24px' }}>
      <Card bodyStyle={{ padding: screens.xs ? '12px' : '24px' }}>
        <PageHeader
          title="Prospectos"
          subTitle={screens.xs ? null : "Seguimiento de leads vía WhatsApp – Conversaciones del Chatbot"}
          style={{
            padding: screens.xs ? '0 0 12px' : '0 0 24px'
          }}
        />
        
        <Space direction="vertical" style={{ marginBottom: 16, width: '100%' }}>
          <Row gutter={[screens.xs ? 8 : 16, screens.xs ? 8 : 16]}>
            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: '8px' }}>
                <Typography.Text>Buscar</Typography.Text>
              </div>
              <Search
                placeholder="Buscar por nombre o WhatsApp"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: screens.xs ? '4px' : '8px' }}>
                <Typography.Text>Etapa</Typography.Text>
              </div>
              <Select
                style={{ width: '100%' }}
                placeholder="Filtrar por etapa"
                allowClear
                value={etapaFilter}
                onChange={value => setEtapaFilter(value)}
                popupMatchSelectWidth={false}
                defaultOpen={false}
                size={screens.xs ? "middle" : "large"}
              >
                {etapas.map(etapa => (
                  <Select.Option key={etapa.value} value={etapa.value}>
                    {etapa.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: screens.xs ? '4px' : '8px' }}>
                <Typography.Text>Proyecto</Typography.Text>
              </div>
              <Select
                style={{ width: '100%' }}
                placeholder="Filtrar por proyecto"
                allowClear
                value={proyectoFilter}
                onChange={value => setProyectoFilter(value)}
                loading={loadingProjects}
                popupMatchSelectWidth={false}
                defaultOpen={false}
                size={screens.xs ? "middle" : "large"}
              >
                {projects.map(project => (
                  <Select.Option key={project.id} value={project.nombre}>
                    {project.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Space>

        <List
          loading={loading}
          dataSource={filteredProspects}
          renderItem={item => (
            <List.Item
              actions={[
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedProspect(item);
                    setViewModalVisible(true);
                  }}
                />,
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedProspect(item);
                    form.setFieldsValue({
                      ...item,
                      fecha_proximo_seguimiento: item.fecha_proximo_seguimiento ? dayjs(item.fecha_proximo_seguimiento) : null,
                    });
                    setEditModalVisible(true);
                  }}
                />,
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDelete(item.id)}
                />,
              ]}
            >
              <List.Item.Meta
                title={item.nombre}
                description={
                  <Space
                    wrap={screens.xs}
                    split={screens.xs ? null : <Divider type="vertical" />}
                    size={screens.xs ? "small" : "middle"}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: screens.xs ? '4px' : '8px'
                    }}
                  >
                    <Tag color={getTagColor(item.etapa)}>{item.etapa}</Tag>
                    <Typography.Text style={{ fontSize: screens.xs ? '13px' : '14px' }}>
                      📱 {item.numero_whatsapp}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: screens.xs ? '13px' : '14px' }}>
                      🏠 {screens.xs ? item.proyecto_interesado.substring(0, 15) + '...' : item.proyecto_interesado}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: screens.xs ? '13px' : '14px' }}>
                      📆 {item.fecha_proximo_seguimiento ? dayjs(item.fecha_proximo_seguimiento).format('DD/MM/YYYY') : 'No programado'}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: screens.xs ? '13px' : '14px' }}>
                      🔁 {item.cantidad_seguimientos}
                    </Typography.Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        <Modal
          title="Detalles del Prospecto"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={screens.xs ? '95%' : '520px'}
          style={{ top: screens.xs ? 20 : 100 }}
          bodyStyle={{
            padding: screens.xs ? '12px' : '24px',
            fontSize: screens.xs ? '14px' : '16px'
          }}
        >
          {selectedProspect && (
            <div>
              <p><strong>Nombre:</strong> {selectedProspect.nombre}</p>
              <p><strong>WhatsApp:</strong> {selectedProspect.numero_whatsapp}</p>
              <p><strong>Proyecto Interesado:</strong> {selectedProspect.proyecto_interesado}</p>
              <p><strong>Etapa:</strong> <Tag color={getTagColor(selectedProspect.etapa)}>{selectedProspect.etapa}</Tag></p>
              <p><strong>Próximo Seguimiento:</strong> {selectedProspect.fecha_proximo_seguimiento ? dayjs(selectedProspect.fecha_proximo_seguimiento).format('DD/MM/YYYY') : 'No programado'}</p>
              <p><strong>Cantidad de Seguimientos:</strong> {selectedProspect.cantidad_seguimientos}</p>
            </div>
          )}
        </Modal>

        <Modal
          title="Editar Prospecto"
          open={editModalVisible}
          onOk={form.submit}
          onCancel={() => setEditModalVisible(false)}
          width={screens.xs ? '95%' : '520px'}
          style={{ top: screens.xs ? 20 : 100 }}
          bodyStyle={{
            padding: screens.xs ? '12px' : '24px'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEdit}
            size={screens.xs ? "middle" : "large"}
          >
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="etapa"
              label="Etapa"
              rules={[{ required: true, message: 'Por favor selecciona la etapa' }]}
            >
              <Select>
                {etapas.map(etapa => (
                  <Select.Option key={etapa.value} value={etapa.value}>
                    {etapa.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="proyecto_interesado"
              label="Proyecto"
              rules={[{ required: true, message: 'Por favor selecciona el proyecto' }]}
            >
              <Select loading={loadingProjects}>
                {projects.map(project => (
                  <Select.Option key={project.id} value={project.nombre}>
                    {project.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="fecha_proximo_seguimiento"
              label="Próxima fecha de seguimiento"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default Prospects_admin;