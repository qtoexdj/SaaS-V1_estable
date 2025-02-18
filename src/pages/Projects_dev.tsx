import React, { useEffect, useState } from 'react';
import {
  Card,
  List,
  Typography,
  Spin,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  App,
  Popconfirm,
  Space,
  Collapse,
  Tag,
  Row,
  Col,
  theme
} from 'antd';
import {
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { Project } from '../types/project';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface Inmobiliaria {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
  projects?: Project[];
}

const ProjectsContent: React.FC = () => {
  // Theme token
  const { token } = theme.useToken();

  // Estados
  const [inmobiliarias, setInmobiliarias] = useState<Inmobiliaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedInmobiliariaId, setSelectedInmobiliariaId] = useState<string | null>(null);

  // Form y Message
  const [form] = Form.useForm();
  const { message } = App.useApp();

  // Data fetching
  const fetchData = async () => {
    try {
      // Obtener inmobiliarias
      const { data: inmobiliariasData, error: inmobiliariasError } = await supabase
        .from('inmobiliarias')
        .select('*')
        .order('nombre');

      if (inmobiliariasError) throw inmobiliariasError;

      // Obtener proyectos
      const { data: projectsData, error: projectsError } = await supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Agrupar proyectos por inmobiliaria
      const inmobiliariasWithProjects = inmobiliariasData.map((inmobiliaria: Inmobiliaria) => ({
        ...inmobiliaria,
        projects: projectsData.filter((project: Project) => project.inmobiliaria_id === inmobiliaria.id)
      }));

      setInmobiliarias(inmobiliariasWithProjects);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      nombre: project.nombre,
      ubicacion: project.ubicacion,
      caracteristicas: project.caracteristicas ? JSON.stringify(project.caracteristicas) : ''
    });
    setIsModalVisible(true);
  };

  const handleCreate = async (values: any) => {
    if (!selectedInmobiliariaId) {
      message.error('No se ha seleccionado una inmobiliaria');
      return;
    }

    try {
      let caracteristicas = {};
      if (values.caracteristicas) {
        try {
          caracteristicas = JSON.parse(values.caracteristicas);
        } catch (e) {
          message.error('El formato de características no es válido');
          return;
        }
      }

      const { data: newProject, error } = await supabase
        .from('proyectos')
        .insert([{
          nombre: values.nombre,
          ubicacion: values.ubicacion,
          caracteristicas,
          inmobiliaria_id: selectedInmobiliariaId
        }])
        .select()
        .single();

      if (error) throw error;

      message.success('Proyecto creado exitosamente');
      
      setInmobiliarias(inmobiliarias.map(inm => {
        if (inm.id === selectedInmobiliariaId) {
          return {
            ...inm,
            projects: [newProject, ...(inm.projects || [])]
          };
        }
        return inm;
      }));

      handleCancelCreate();
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
      message.error('Error al crear el proyecto');
    }
  };

  const handleUpdate = async (values: any) => {
    if (!editingProject) return;

    try {
      let caracteristicas = {};
      if (values.caracteristicas) {
        try {
          caracteristicas = JSON.parse(values.caracteristicas);
        } catch (e) {
          message.error('El formato de características no es válido');
          return;
        }
      }

      const { error } = await supabase
        .from('proyectos')
        .update({
          nombre: values.nombre,
          ubicacion: values.ubicacion,
          caracteristicas,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      message.success('Proyecto actualizado exitosamente');
      
      setInmobiliarias(inmobiliarias.map(inm => ({
        ...inm,
        projects: inm.projects?.map(p =>
          p.id === editingProject.id
            ? { ...p, ...values, caracteristicas }
            : p
        )
      })));

      handleCancel();
    } catch (error) {
      console.error('Error al actualizar el proyecto:', error);
      message.error('Error al actualizar el proyecto');
    }
  };

  const handleDelete = async (projectId: string, inmobiliariaId: string) => {
    try {
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      message.success('Proyecto eliminado exitosamente');
      
      setInmobiliarias(inmobiliarias.map(inm => {
        if (inm.id === inmobiliariaId) {
          return {
            ...inm,
            projects: inm.projects?.filter(p => p.id !== projectId)
          };
        }
        return inm;
      }));
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      message.error('Error al eliminar el proyecto');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProject(null);
    form.resetFields();
  };

  const handleCancelCreate = () => {
    setIsCreateModalVisible(false);
    setSelectedInmobiliariaId(null);
    form.resetFields();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        marginBottom: 24,
        padding: '16px 24px',
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Title level={2} style={{ margin: 0 }}>Gestión de Inmobiliarias y Proyectos</Title>
      </div>

      <Row gutter={[16, 16]}>
        {inmobiliarias.map(inmobiliaria => (
          <Col xs={24} key={inmobiliaria.id}>
            <Card
              title={
                <Space>
                  <HomeOutlined />
                  <Text strong>{inmobiliaria.nombre}</Text>
                  {inmobiliaria.activo ? (
                    <Tag color="success">Activa</Tag>
                  ) : (
                    <Tag color="error">Inactiva</Tag>
                  )}
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedInmobiliariaId(inmobiliaria.id);
                    setIsCreateModalVisible(true);
                  }}
                >
                  Nuevo Proyecto
                </Button>
              }
            >
              <Collapse>
                <Panel 
                  header={
                    <Space>
                      <EyeOutlined />
                      <Text>Ver Proyectos ({inmobiliaria.projects?.length || 0})</Text>
                    </Space>
                  } 
                  key="1"
                >
                  {!inmobiliaria.projects?.length ? (
                    <Empty description="No hay proyectos" />
                  ) : (
                    <List
                      grid={{ gutter: 16, column: 2 }}
                      dataSource={inmobiliaria.projects}
                      renderItem={project => (
                        <List.Item>
                          <Card
                            size="small"
                            title={project.nombre}
                            extra={
                              <Space>
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEdit(project)}
                                />
                                <Popconfirm
                                  title="¿Eliminar proyecto?"
                                  description="¿Estás seguro de que deseas eliminar este proyecto?"
                                  onConfirm={() => handleDelete(project.id, inmobiliaria.id)}
                                  okText="Sí"
                                  cancelText="No"
                                >
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                  />
                                </Popconfirm>
                              </Space>
                            }
                          >
                            <div style={{ marginBottom: 8 }}>
                              <EnvironmentOutlined style={{ marginRight: 8 }} />
                              <Text>{project.ubicacion}</Text>
                            </div>
                            
                            {project.caracteristicas && (
                              <Space wrap>
                                {Object.entries(project.caracteristicas).map(([key, value]) => (
                                  <Tag key={key}>{`${key}: ${value}`}</Tag>
                                ))}
                              </Space>
                            )}
                          </Card>
                        </List.Item>
                      )}
                    />
                  )}
                </Panel>
              </Collapse>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Editar Proyecto"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={editingProject || {}}
        >
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ubicacion"
            label="Ubicación"
            rules={[{ required: true, message: 'Por favor ingrese la ubicación' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="caracteristicas"
            label="Características (formato JSON)"
            help="Ejemplo: {'habitaciones': 3, 'baños': 2}"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Guardar
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Nuevo Proyecto"
        open={isCreateModalVisible}
        onCancel={handleCancelCreate}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{}}
        >
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ubicacion"
            label="Ubicación"
            rules={[{ required: true, message: 'Por favor ingrese la ubicación' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="caracteristicas"
            label="Características (formato JSON)"
            help="Ejemplo: {'habitaciones': 3, 'baños': 2}"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={handleCancelCreate}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Crear
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const Projects_dev: React.FC = () => {
  return (
    <App>
      <ProjectsContent />
    </App>
  );
};

export default Projects_dev;