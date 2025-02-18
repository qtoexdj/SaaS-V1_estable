import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, Empty, Button, Modal, Form, Input, App, Popconfirm, Space } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { Project } from '../types/project';
import { useAuth } from '../hooks/useAuth';

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

  const handleCreate = async (values: any) => {
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
          inmobiliaria_id: user?.app_metadata?.inmobiliaria_id
        }])
        .select()
        .single();

      if (error) throw error;

      message.success('Proyecto creado exitosamente');
      setProjects([newProject, ...projects]);
      handleCancelCreate();
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
      message.error('Error al crear el proyecto');
    }
  };

  const handleCancelCreate = () => {
    setIsCreateModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      nombre: project.nombre,
      ubicacion: project.ubicacion,
      caracteristicas: project.caracteristicas ? JSON.stringify(project.caracteristicas) : ''
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', projectId);

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
    form.resetFields();
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
      
      setProjects(projects.map(p => 
        p.id === editingProject.id 
          ? { ...p, ...values, caracteristicas } 
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
        const { data, error } = await supabase
          .from('proyectos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProjects(data || []);
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
        message.error('Error al cargar los proyectos');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [message]);

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

const Projects_admin: React.FC = () => {
  return (
    <App>
      <ProjectsContent />
    </App>
  );
};

export default Projects_admin;