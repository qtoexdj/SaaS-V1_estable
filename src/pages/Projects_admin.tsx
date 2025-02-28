import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, Empty, Button, Modal, Form, Input, App, Popconfirm, Space, Divider } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { Project, ProjectImage } from '../types/project';
import { useAuth } from '../hooks/useAuth';
import ProjectImageGallery from '../components/ProjectImageGallery';
import ProjectImageUploader from '../components/ProjectImageUploader';
import { getProjectImages } from '../services/projectImages';

const { Text, Title } = Typography;

const ProjectsContent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { user } = useAuth();
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);

  const handleCreate = async (values: any) => {
    try {
      // Asegurarse de que tenemos el ID de la inmobiliaria del usuario
      if (!user?.inmobiliaria_id) {
        console.error('No se encontró el ID de la inmobiliaria del usuario');
        message.error('Error al crear el proyecto: No se encontró la inmobiliaria');
        return;
      }

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
          cantidad_lotes: values.cantidad_lotes ? parseInt(values.cantidad_lotes) : null,
          caracteristicas,
          inmobiliaria_id: user.inmobiliaria_id // Usar el ID de la inmobiliaria del usuario
        }])
        .select()
        .single();

      if (error) throw error;

      message.success('Proyecto creado exitosamente');
      
      // Si hay imágenes, actualizar el proyecto con ellas
      const projectWithImages = { ...newProject, images: projectImages };
      setProjects([projectWithImages, ...projects]);
      handleCancelCreate();
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
      message.error('Error al crear el proyecto');
    }
  };

  const handleCancelCreate = () => {
    setIsCreateModalVisible(false);
    setProjectImages([]);
    form.resetFields();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      nombre: project.nombre,
      ubicacion: project.ubicacion,
      cantidad_lotes: project.cantidad_lotes?.toString() || '',
      caracteristicas: project.caracteristicas ? JSON.stringify(project.caracteristicas) : ''
    });
    setProjectImages(project.images || []);
    setIsModalVisible(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      // Asegurarse de que tenemos el ID de la inmobiliaria del usuario
      if (!user?.inmobiliaria_id) {
        console.error('No se encontró el ID de la inmobiliaria del usuario');
        message.error('Error al eliminar el proyecto: No se encontró la inmobiliaria');
        return;
      }

      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', projectId)
        .eq('inmobiliaria_id', user.inmobiliaria_id); // Filtrar por inmobiliaria_id para cumplir con las políticas RLS

      if (error) throw error;

      message.success('Proyecto eliminado exitosamente');
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      message.error('Error al eliminar el proyecto');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProject(null);
    setProjectImages([]);
    form.resetFields();
  };

  const handleUpdate = async (values: any) => {
    if (!editingProject) return;

    try {
      // Asegurarse de que tenemos el ID de la inmobiliaria del usuario
      if (!user?.inmobiliaria_id) {
        console.error('No se encontró el ID de la inmobiliaria del usuario');
        message.error('Error al actualizar el proyecto: No se encontró la inmobiliaria');
        return;
      }

      // Verificar que el proyecto pertenece a la inmobiliaria del usuario
      if (editingProject.inmobiliaria_id !== user.inmobiliaria_id) {
        console.error('El proyecto no pertenece a la inmobiliaria del usuario');
        message.error('Error al actualizar el proyecto: No tienes permisos para editar este proyecto');
        return;
      }

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
          cantidad_lotes: values.cantidad_lotes ? parseInt(values.cantidad_lotes) : null,
          caracteristicas,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProject.id)
        .eq('inmobiliaria_id', user.inmobiliaria_id); // Filtrar por inmobiliaria_id para cumplir con las políticas RLS

      if (error) throw error;

      message.success('Proyecto actualizado exitosamente');
      
      setProjects(projects.map(p =>
        p.id === editingProject.id
          ? { ...p, ...values, caracteristicas, images: projectImages }
          : p
      ));

      handleCancel();
    } catch (error) {
      console.error('Error al actualizar el proyecto:', error);
      message.error('Error al actualizar el proyecto');
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Asegurarse de que tenemos el ID de la inmobiliaria del usuario
        if (!user?.inmobiliaria_id) {
          console.error('No se encontró el ID de la inmobiliaria del usuario');
          message.error('Error al cargar los proyectos: No se encontró la inmobiliaria');
          setLoading(false);
          return;
        }

        // Filtrar por inmobiliaria_id para cumplir con las políticas RLS
        const { data, error } = await supabase
          .from('proyectos')
          .select('*')
          .eq('inmobiliaria_id', user.inmobiliaria_id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Cargar las imágenes para cada proyecto
        const projectsWithImages = await Promise.all(
          (data || []).map(async (project) => {
            try {
              const images = await getProjectImages(project.id);
              return { ...project, images };
            } catch (err) {
              console.error(`Error al cargar imágenes para el proyecto ${project.id}:`, err);
              return { ...project, images: [] };
            }
          })
        );

        setProjects(projectsWithImages);
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        message.error('Error al cargar los proyectos');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [message, user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Proyectos</Title>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            form.resetFields();
            setIsCreateModalVisible(true);
          }}
        >
          Nuevo Proyecto
        </Button>
      </div>

      {projects.length === 0 ? (
        <Empty description="No hay proyectos disponibles" />
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={projects}
          renderItem={(project) => (
            <List.Item>
              <Card
                title={project.nombre}
                hoverable
                style={{ height: '100%' }}
              >
                <div style={{ marginBottom: 12 }}>
                  <EnvironmentOutlined style={{ marginRight: 8 }} />
                  <Text>{project.ubicacion}</Text>
                </div>

                {project.cantidad_lotes && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Cantidad de Lotes:</Text> {project.cantidad_lotes}
                  </div>
                )}
                
                {project.caracteristicas && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Características:</Text>
                    <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                      {Object.entries(project.caracteristicas).map(([key, value]) => (
                        <li key={key}>
                          <Text>{`${key}: ${value}`}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Galería de imágenes */}
                {project.images && project.images.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Divider orientation="left">
                      <PictureOutlined /> Imágenes
                    </Divider>
                    <ProjectImageGallery images={project.images} />
                  </div>
                )}

                <div style={{ marginBottom: 12 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <Text type="secondary">
                    {new Date(project.created_at).toLocaleDateString()}
                  </Text>
                </div>

                <div style={{ textAlign: 'right', marginTop: 'auto' }}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(project)}
                    >
                      Editar
                    </Button>
                    <Popconfirm
                      title="¿Eliminar proyecto?"
                      description="¿Estás seguro de que deseas eliminar este proyecto?"
                      onConfirm={() => handleDelete(project.id)}
                      okText="Sí"
                      cancelText="No"
                      placement="topRight"
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                      >
                        Eliminar
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}

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
            name="cantidad_lotes"
            label="Cantidad de Lotes"
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="caracteristicas"
            label="Características (formato JSON)"
            help="Ejemplo: {'habitaciones': 3, 'baños': 2}"
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
            name="cantidad_lotes"
            label="Cantidad de Lotes"
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="caracteristicas"
            label="Características (formato JSON)"
            help="Ejemplo: {'habitaciones': 3, 'baños': 2}"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Imágenes del Proyecto"
            help="Máximo 5 imágenes por proyecto (Podrá subir imágenes después de crear el proyecto)"
          >
            <ProjectImageUploader
              projectId=""
              existingImages={[]}
              onImagesChange={setProjectImages}
              disabled={true}
            />
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

const Projects_admin: React.FC = () => {
  return (
    <App>
      <ProjectsContent />
    </App>
  );
};

export default Projects_admin;