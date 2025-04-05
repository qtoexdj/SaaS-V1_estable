import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Input, 
  Select, 
  Space, 
  Button, 
  Modal, 
  Form, 
  DatePicker, 
  Row, 
  Col, 
  Typography, 
  Divider, 
  Grid,
  Statistic,
  message,
  Spin
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  FunnelPlotOutlined,
  FireOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { DragableKanban } from '../components/DragableKanban';
import { DropResult } from 'react-beautiful-dnd';
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
  inmobiliaria_id: string;
  inmobiliaria?: {
    nombre: string;
  };
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  nombre: string;
}

interface GlobalStats {
  total: number;
  activos: number;
  nuevosSemana: number;
  conversionRate: number;
  tiempoPromedio: number;
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

const calculateStats = (prospects: Prospect[]): GlobalStats => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const nuevosSemana = prospects.filter(p => new Date(p.created_at) > oneWeekAgo).length;
  const activos = prospects.filter(p => p.etapa !== 'No interesado').length;
  const calificados = prospects.filter(p => p.etapa === 'Calificado').length;
  const conversionRate = prospects.length > 0 ? (calificados / prospects.length) * 100 : 0;

  const completedProspects = prospects.filter(p => 
    p.etapa === 'Calificado' || p.etapa === 'No interesado'
  );
  
  let tiempoPromedio = 0;
  if (completedProspects.length > 0) {
    const totalTime = completedProspects.reduce((acc, prospect) => {
      const start = new Date(prospect.created_at);
      const end = new Date(prospect.updated_at);
      return acc + (end.getTime() - start.getTime());
    }, 0);
    tiempoPromedio = Math.round(totalTime / completedProspects.length / (1000 * 60 * 60 * 24));
  }

  return {
    total: prospects.length,
    activos,
    nuevosSemana,
    conversionRate,
    tiempoPromedio
  };
};

const Prospects_admin: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
  const [activeView, setActiveView] = useState('kanban');
  const [stats, setStats] = useState<GlobalStats>({
    total: 0,
    activos: 0,
    nuevosSemana: 0,
    conversionRate: 0,
    tiempoPromedio: 0
  });

  const fetchProjects = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!userData?.user?.app_metadata?.inmobiliaria_id) {
        console.error('No se encontró el ID de la inmobiliaria del usuario');
        setLoadingProjects(false);
        return;
      }
      
      const inmobiliariaId = userData.user.app_metadata.inmobiliaria_id;
      
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!userData?.user?.app_metadata?.inmobiliaria_id) {
        console.error('No se encontró el ID de la inmobiliaria del usuario');
        setLoading(false);
        return;
      }
      
      const inmobiliariaId = userData.user.app_metadata.inmobiliaria_id;
      
      const { data, error } = await supabase
        .from('prospectos')
        .select('*')
        .eq('inmobiliaria_id', inmobiliariaId);

      if (error) throw error;

      setProspects(data || []);
      setStats(calculateStats(data || []));
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
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!userData?.user?.app_metadata?.inmobiliaria_id || !selectedProspect) {
        throw new Error('No se puede editar el prospecto');
      }
      
      const inmobiliariaId = userData.user.app_metadata.inmobiliaria_id;

      const { error } = await supabase
        .from('prospectos')
        .update({
          nombre: values.nombre,
          etapa: values.etapa,
          proyecto_interesado: values.proyecto_interesado,
          fecha_proximo_seguimiento: values.fecha_proximo_seguimiento.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProspect.id)
        .eq('inmobiliaria_id', inmobiliariaId);

      if (error) throw error;

      message.success('Prospecto actualizado correctamente');
      setEditModalVisible(false);
      fetchProspects();
    } catch (error: any) {
      console.error('Error updating prospect:', error);
      message.error('Error al actualizar el prospecto');
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
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) throw userError;
          
          if (!userData?.user?.app_metadata?.inmobiliaria_id) {
            throw new Error('No se puede eliminar el prospecto');
          }
          
          const inmobiliariaId = userData.user.app_metadata.inmobiliaria_id;

          const { error } = await supabase
            .from('prospectos')
            .delete()
            .eq('id', id)
            .eq('inmobiliaria_id', inmobiliariaId);

          if (error) throw error;

          message.success('Prospecto eliminado correctamente');
          fetchProspects();
        } catch (error: any) {
          console.error('Error deleting prospect:', error);
          message.error('Error al eliminar el prospecto');
        }
      },
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.droppableId === result.destination.droppableId) {
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const inmobiliariaId = userData.user?.app_metadata?.inmobiliaria_id;
      
      if (!inmobiliariaId) {
        throw new Error('No se encontró el ID de la inmobiliaria');
      }

      const prospectId = result.draggableId;
      const newEtapa = result.destination.droppableId;

      const { error } = await supabase
        .from('prospectos')
        .update({
          etapa: newEtapa,
          updated_at: new Date().toISOString()
        })
        .eq('id', prospectId)
        .eq('inmobiliaria_id', inmobiliariaId);

      if (error) throw error;

      setProspects(prospects.map(prospect => 
        prospect.id === prospectId 
          ? { ...prospect, etapa: newEtapa }
          : prospect
      ));

      message.success('Prospecto actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar prospecto:', error);
      message.error('Error al actualizar el prospecto');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    switch (activeView) {
      case 'kanban':
        return (
          <DragableKanban
            prospects={filteredProspects}
            onDragEnd={handleDragEnd}
            onViewDetails={(prospect) => {
              setSelectedProspect(prospect);
              setViewModalVisible(true);
            }}
          />
        );
      case 'list':
        return (
          <List
            dataSource={filteredProspects}
            renderItem={(item: Prospect) => (
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
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: screens.xs ? '0px' : '0px' }}>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>
        Prospectos
      </Typography.Title>
      {!screens.xs && (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Seguimiento de leads vía WhatsApp
        </Typography.Text>
      )}
      
      {/* Dashboard Header */}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={6}>
            <Statistic
              title="Total Prospectos"
              value={stats.total}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col xs={24} lg={6}>
            <Statistic
              title="Tasa de Conversión"
              value={stats.conversionRate}
              precision={2}
              suffix="%"
              prefix={<FunnelPlotOutlined />}
            />
          </Col>
          <Col xs={24} lg={6}>
            <Statistic
              title="Nuevos esta Semana"
              value={stats.nuevosSemana}
              prefix={<FireOutlined />}
            />
          </Col>
          <Col xs={24} lg={6}>
            <Statistic
              title="Tiempo Promedio (días)"
              value={stats.tiempoPromedio}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Filtros y Controles */}
      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space wrap>
                <Select
                  style={{ width: 200 }}
                  placeholder="Filtrar por etapa"
                  allowClear
                  value={etapaFilter}
                  onChange={value => setEtapaFilter(value)}
                >
                  {etapas.map(etapa => (
                    <Select.Option key={etapa.value} value={etapa.value}>
                      {etapa.label}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  style={{ width: 200 }}
                  placeholder="Filtrar por proyecto"
                  allowClear
                  value={proyectoFilter}
                  onChange={value => setProyectoFilter(value)}
                  loading={loadingProjects}
                >
                  {projects.map(project => (
                    <Select.Option key={project.id} value={project.nombre}>
                      {project.nombre}
                    </Select.Option>
                  ))}
                </Select>
                <Search
                  placeholder="Buscar por nombre o WhatsApp"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  type={activeView === 'kanban' ? 'primary' : 'default'}
                  onClick={() => setActiveView('kanban')}
                >
                  Vista Kanban
                </Button>
                <Button
                  type={activeView === 'list' ? 'primary' : 'default'}
                  onClick={() => setActiveView('list')}
                >
                  Vista Lista
                </Button>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Contenido Principal */}
      <Card style={{ marginTop: 16 }}>
        {renderContent()}
      </Card>

      {/* Modales */}
      <Modal
        title="Detalles del Prospecto"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={screens.xs ? '95%' : '520px'}
        style={{ top: screens.xs ? 20 : 100 }}
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
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
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
            <Select>
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
    </div>
  );
};

export default Prospects_admin;
