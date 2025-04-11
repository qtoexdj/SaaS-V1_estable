import React, { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  List,
  Spin,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  App,
  Space,
  Row,
  Col,
  Statistic,
  Image,
  Typography,
  Tooltip,
  Tag,
  Avatar
} from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  FileImageOutlined,
  PlusOutlined,
  BarsOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { Project, ProjectImage } from '../types/project';
import { useAuth } from '../hooks/useAuth';
import ProjectImageUploader from '../components/ProjectImageUploader';
import { getProjectImages } from '../services/projectImages';
import { vectorSyncService } from '../services/vectorSyncService';
import ProjectCard from '../components/ProjectCard';

const { Search } = Input;
const { Text } = Typography;

interface Stats {
  totalProyectos: number;
  imagenesSubidas: number;
}

const ProjectsContent: React.FC = () => {
  // Estados
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { user } = useAuth();
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedProjectForGallery, setSelectedProjectForGallery] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalProyectos: 0,
    imagenesSubidas: 0,
  });

  // Funciones auxiliares
  const calculateStats = (projectsData: Project[]) => {
    setStats({
      totalProyectos: projectsData.length,
      imagenesSubidas: projectsData.reduce((acc, p) => acc + (p.images?.length || 0), 0)
    });
  };


  // Función para cargar proyectos (extraída para reutilización)
  const fetchProjects = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      if (!user?.inmobiliaria_id) {
        message.error('No se encontró el ID de la inmobiliaria');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .eq('inmobiliaria_id', user.inmobiliaria_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithImages = await Promise.all(
        (data || []).map(async (project) => {
          const images = await getProjectImages(project.id);
          return { ...project, images };
        })
      );

      setProjects(projectsWithImages);
      calculateStats(projectsWithImages);
    } catch (error: any) {
      console.error('Error al cargar proyectos:', error);
      if (error.code) {
        message.error(`Error al cargar los proyectos: ${error.message} (Código: ${error.code})`);
      } else {
        message.error(`Error al cargar los proyectos: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    fetchProjects();
  }, [user, message]);

  const filteredProjects = projects.filter(project => {
    return project.caracteristicas.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      project.caracteristicas.ubicacion.toLowerCase().includes(searchText.toLowerCase());
  });

  // Handlers
  const handleCreate = async (values: any) => {
    try {
      if (!user?.inmobiliaria_id) {
        message.error('No se encontró el ID de la inmobiliaria');
        return;
      }

      const newProjectData = {
        caracteristicas: {
          nombre: values.nombre,
          ubicacion: values.ubicacion,
          valor: values.valor,
          caracteristicas: values.caracteristicas
        },
        inmobiliaria_id: user.inmobiliaria_id
      };

      const { data, error } = await supabase
        .from('proyectos')
        .insert([newProjectData])
        .select()
        .single();

      if (error) throw error;

      // Notificar al servicio de vectores de forma asíncrona
      vectorSyncService.notifyProjectChange(
        user.inmobiliaria_id,
        data.id,
        'INSERT'
      ).then(success => {
        if (!success) {
          console.warn(`No se pudo notificar la creación del proyecto ${data.id} al servicio de vectores`);
        }
      }).catch(e => {
        console.error('Error en notificación de vector sync:', e);
      });

      message.success('Proyecto creado exitosamente');

      // Recargar proyectos para asegurar consistencia
      await fetchProjects(false);

      setIsCreateModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error('Error al crear el proyecto:', error);
      // Mejorar el mensaje de error para proporcionar información más específica
      if (error.code) {
        message.error(`Error al crear el proyecto: ${error.message} (Código: ${error.code})`);
      } else {
        message.error(`Error al crear el proyecto: ${error.message}`);
      }
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    
    // Establecer los valores del formulario
    form.setFieldsValue({
      nombre: project.caracteristicas.nombre,
      ubicacion: project.caracteristicas.ubicacion,
      valor: project.caracteristicas.valor,
      caracteristicas: project.caracteristicas.caracteristicas
    });
    setProjectImages(project.images || []);
    setIsModalVisible(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      if (!user?.inmobiliaria_id) {
        message.error('No se encontró el ID de la inmobiliaria');
        return;
      }

      // Utilizar la función RPC para eliminar el proyecto y sus vectores asociados
      const { error } = await supabase.rpc('delete_project_with_vectors', {
        project_id: projectId
      });

      if (error) {
        throw error;
      }

      message.success('Proyecto eliminado exitosamente');
      
      // Recargar proyectos para asegurar consistencia
      await fetchProjects(false);
    } catch (error: any) {
      console.error('Error al eliminar el proyecto:', error);
      // Mejorar el mensaje de error para proporcionar información más específica
      if (error.code) {
        message.error(`Error al eliminar el proyecto: ${error.message} (Código: ${error.code})`);
      } else {
        message.error(`Error al eliminar el proyecto: ${error.message}`);
      }
    }
  };

  const handleUpdate = async (values: any) => {
    if (!editingProject) return;

    try {
      if (!user?.inmobiliaria_id) {
        message.error('No se encontró el ID de la inmobiliaria');
        return;
      }

      const updatedProject = {
        caracteristicas: {
          nombre: values.nombre,
          ubicacion: values.ubicacion,
          valor: values.valor,
          caracteristicas: values.caracteristicas
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('proyectos')
        .update(updatedProject)
        .eq('id', editingProject.id)
        .eq('inmobiliaria_id', user.inmobiliaria_id);

      if (error) throw error;

      // Notificar al servicio de vectores de forma asíncrona
      vectorSyncService.notifyProjectChange(
        user.inmobiliaria_id,
        editingProject.id,
        'UPDATE'
      ).then(success => {
        if (!success) {
          console.warn(`No se pudo notificar la actualización del proyecto ${editingProject.id} al servicio de vectores`);
        }
      }).catch(e => {
        console.error('Error en notificación de vector sync:', e);
      });

      message.success('Proyecto actualizado exitosamente');
      
      // Recargar proyectos para asegurar consistencia
      await fetchProjects(false);
      
      setIsModalVisible(false);
      setEditingProject(null);
      form.resetFields();
    } catch (error: any) {
      console.error('Error al actualizar el proyecto:', error);
      // Mejorar el mensaje de error para proporcionar información más específica
      if (error.code) {
        message.error(`Error al actualizar el proyecto: ${error.message} (Código: ${error.code})`);
      } else {
        message.error(`Error al actualizar el proyecto: ${error.message}`);
      }
    }
  };

  return (
    <Layout.Content style={{ padding: 0 }}>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>
        Proyectos
      </Typography.Title>
      {/* Dashboard Header */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} xl={12}>
                <Statistic
                  title="Total Proyectos"
                  value={stats.totalProyectos}
                  prefix={<HomeOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} xl={12}>
                <Statistic
                  title="Imágenes Subidas"
                  value={stats.imagenesSubidas}
                  prefix={<FileImageOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Controles */}
        <Col span={24}>
          <Card>
            <Row gutter={[16, 16]} align="middle">
              <Col flex="auto">
                <Search
                  placeholder="Buscar proyectos..."
                  onSearch={value => setSearchText(value)}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  allowClear
                />
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<AppstoreOutlined />}
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => setViewMode('grid')}
                  />
                  <Button
                    icon={<BarsOutlined />}
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      form.resetFields();
                      setIsCreateModalVisible(true);
                    }}
                  >
                    Nuevo Proyecto
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Lista de Proyectos */}
        <Col span={24}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : projects.length === 0 ? (
            <Empty description="No hay proyectos disponibles" />
          ) : viewMode === 'grid' ? (
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
              dataSource={filteredProjects}
              renderItem={(project) => (
                <List.Item>
                  <ProjectCard
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewImages={(project) => {
                      setSelectedProjectForGallery(project);
                      setGalleryVisible(true);
                    }}
                  />
                </List.Item>
              )}
            />
          ) : (
            // Vista de lista mejorada y responsiva
            <List
              className="project-list-view"
              itemLayout="horizontal"
              dataSource={filteredProjects}
              renderItem={(project) => (
                <List.Item
                  style={{ padding: '16px', background: '#fff', marginBottom: '8px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  actions={[
                    <Tooltip title="Editar proyecto" key="edit">
                      <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(project)} />
                    </Tooltip>,
                    <Tooltip title="Ver imágenes" key="images">
                      <Button 
                        type="text" 
                        icon={<FileImageOutlined />} 
                        onClick={() => {
                          setSelectedProjectForGallery(project);
                          setGalleryVisible(true);
                        }}
                        disabled={!project.images?.length}
                      />
                    </Tooltip>,
                    <Tooltip title="Eliminar proyecto" key="delete">
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(project.id)} 
                      />
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      project.images && project.images.length > 0 ? (
                        <Avatar 
                          shape="square" 
                          size={64} 
                          src={project.images[0].url}
                          style={{ borderRadius: '4px' }}
                        />
                      ) : (
                        <Avatar 
                          shape="square" 
                          size={64} 
                          icon={<HomeOutlined />} 
                          style={{ background: '#f0f2f5', borderRadius: '4px' }}
                        />
                      )
                    }
                    title={
                      <Space size={[8, 16]} wrap>
                        <Text strong style={{ fontSize: '16px' }}>{project.caracteristicas.nombre}</Text>
                        {project.caracteristicas.valor && (
                          <Tag color="green">{project.caracteristicas.valor}</Tag>
                        )}
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <CalendarOutlined /> {new Date(project.created_at).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                    description={
                      <div>
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Text>
                            <EnvironmentOutlined style={{ marginRight: 8 }} />
                            {project.caracteristicas.ubicacion}
                          </Text>
                          {project.caracteristicas.caracteristicas && typeof project.caracteristicas.caracteristicas === 'string' && (
                            <div style={{ marginTop: 8 }}>
                              {project.caracteristicas.caracteristicas.split(',').map((feature, index) => (
                                feature.trim() && <Tag key={index} style={{ marginBottom: 4 }}>{feature.trim()}</Tag>
                              ))}
                            </div>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Total: ${total} proyectos`,
                showSizeChanger: true,
                responsive: true,
              }}
            />
          )}
        </Col>
      </Row>

      {/* Modal de Edición */}
      <Modal
        title="Editar Proyecto"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProject(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
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
            name="valor"
            label="Valor"
            help="Ingrese el valor del proyecto"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="caracteristicas"
            label="Características"
            help="Ingrese las características adicionales del proyecto"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Imágenes del Proyecto"
            help="Máximo 5 imágenes por proyecto"
          >
            <ProjectImageUploader
              projectId={editingProject?.id || ''}
              existingImages={projectImages}
              onImagesChange={setProjectImages}
              disabled={!editingProject}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingProject(null);
                form.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Guardar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Creación */}
      <Modal
        title="Nuevo Proyecto"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            nombre: '',
            ubicacion: '',
            caracteristicas: []
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
            name="ubicacion"
            label="Ubicación"
            rules={[{ required: true, message: 'Por favor ingrese la ubicación' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="valor"
            label="Valor"
            help="Ingrese el valor del proyecto"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="caracteristicas"
            label="Características"
            help="Ingrese las características adicionales del proyecto"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Crear
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Galería de Imágenes */}
      <Modal
        title={`Imágenes de ${selectedProjectForGallery?.caracteristicas.nombre || 'Proyecto'}`}
        open={galleryVisible}
        onCancel={() => {
          setGalleryVisible(false);
          setSelectedProjectForGallery(null);
        }}
        footer={null}
        width={800}
      >
        {selectedProjectForGallery?.images && selectedProjectForGallery.images.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {selectedProjectForGallery.images.map((image, index) => (
              <div key={image.id} style={{ aspectRatio: '1', overflow: 'hidden' }}>
                <Image
                  src={image.url}
                  alt={`${selectedProjectForGallery.caracteristicas.nombre} - Imagen ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty description="No hay imágenes disponibles" />
        )}
      </Modal>
    </Layout.Content>
  );
};

const Projects_admin: React.FC = () => {
  return (
    <App>
      <ProjectsContent />
    </App>
  );
};

export default Projects_admin;