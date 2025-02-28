import { FC, useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Switch, message, Space,
  Popconfirm, Card, Badge, Tooltip, Tabs, Typography, Descriptions
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps } from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  WhatsAppOutlined, GlobalOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { supabase } from '../config/supabase';

const { Text } = Typography;

// Definición de interfaces basadas en la estructura de la tabla
interface RedesSociales {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

interface InmobiliariaInfo {
  direccion?: string;
  sitio_web?: string;
  email_contacto?: string;
  telefono_oficina?: string;
  horario_atencion?: string;
  descripcion?: string;
  redes_sociales?: RedesSociales;
}

interface Inmobiliaria {
  id: string;
  nombre: string;
  activo: boolean;
  whatsapp_chatbot?: string;
  inmobi_info?: InmobiliariaInfo;
  created_at: string;
  updated_at: string;
}

// Interfaz para el formulario
interface InmobiliariaFormData {
  nombre: string;
  activo: boolean;
  whatsapp_chatbot?: string;
  direccion?: string;
  sitio_web?: string;
  email_contacto?: string;
  telefono_oficina?: string;
  horario_atencion?: string;
  descripcion?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

// Componente para el contenido del formulario en pestañas
const FormContent: FC = () => {
  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Información Básica',
      children: (
        <>
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
            <Switch
              checkedChildren="Activo"
              unCheckedChildren="Inactivo"
            />
          </Form.Item>
          <Form.Item
            name="whatsapp_chatbot"
            label="WhatsApp Chatbot"
            rules={[
              {
                pattern: /^\+?[\d\s-]+$/,
                message: 'Por favor ingrese un número válido'
              }
            ]}
          >
            <Input placeholder="+56912345678" />
          </Form.Item>
        </>
      ),
    },
    {
      key: '2',
      label: 'Información de Contacto',
      children: (
        <>
          <Form.Item name="direccion" label="Dirección">
            <Input />
          </Form.Item>
          <Form.Item
            name="sitio_web"
            label="Sitio Web"
            rules={[
              {
                type: 'url',
                message: 'Por favor ingrese una URL válida'
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email_contacto"
            label="Email de Contacto"
            rules={[
              {
                type: 'email',
                message: 'Por favor ingrese un email válido'
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="telefono_oficina" label="Teléfono de Oficina">
            <Input />
          </Form.Item>
        </>
      ),
    },
    {
      key: '3',
      label: 'Información Adicional',
      children: (
        <>
          <Form.Item name="horario_atencion" label="Horario de Atención">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      ),
    },
    {
      key: '4',
      label: 'Redes Sociales',
      children: (
        <>
          <Form.Item
            name="facebook"
            label="Facebook"
            rules={[
              {
                type: 'url',
                message: 'Por favor ingrese una URL válida'
              }
            ]}
          >
            <Input placeholder="https://facebook.com/tu-inmobiliaria" />
          </Form.Item>
          <Form.Item
            name="instagram"
            label="Instagram"
            rules={[
              {
                type: 'url',
                message: 'Por favor ingrese una URL válida'
              }
            ]}
          >
            <Input placeholder="https://instagram.com/tu-inmobiliaria" />
          </Form.Item>
          <Form.Item
            name="linkedin"
            label="LinkedIn"
            rules={[
              {
                type: 'url',
                message: 'Por favor ingrese una URL válida'
              }
            ]}
          >
            <Input placeholder="https://linkedin.com/company/tu-inmobiliaria" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Tabs items={tabItems} />
  );
};

export const RealEstate_dev: FC = () => {
  // Estados
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [inmobiliarias, setInmobiliarias] = useState<Inmobiliaria[]>([]);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<Inmobiliaria | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Inmobiliaria | null>(null);
  
  // Formularios
  const [form] = Form.useForm<InmobiliariaFormData>();
  const [createForm] = Form.useForm<InmobiliariaFormData>();

  // Verificar permisos del usuario
  const checkUserPermissions = async (): Promise<{ user: any; userRole: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Obtener el rol del usuario desde app_metadata
      let userRole = user?.app_metadata?.user_rol || user?.app_metadata?.rol;
      
      // Si no se encuentra el rol en las propiedades específicas, buscar en cualquier propiedad
      if (!userRole && user?.app_metadata) {
        const metadataKeys = Object.keys(user.app_metadata);
        for (const key of metadataKeys) {
          if (key.toLowerCase().includes('rol') || key.toLowerCase().includes('role')) {
            userRole = user.app_metadata[key];
            break;
          }
        }
      }
      
      return { user, userRole };
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return { user: null, userRole: null };
    }
  };

  // Cargar inmobiliarias
  const fetchInmobiliarias = useCallback(async () => {
    try {
      setLoading(true);
      
      // Verificar permisos antes de cargar datos
      await checkUserPermissions();
      
      // Consultar inmobiliarias
      const { data, error } = await supabase
        .from('inmobiliarias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setInmobiliarias(data || []);
    } catch (error: any) {
      message.error(`Error al cargar inmobiliarias: ${error.message || 'Error desconocido'}`);
      console.error('Error al cargar inmobiliarias:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear inmobiliaria
  const handleCreate = async (values: InmobiliariaFormData) => {
    setSubmitting(true);
    try {
      // Verificar permisos
      const { userRole } = await checkUserPermissions();
      
      // Solo usuarios con rol 'dev' pueden crear inmobiliarias
      if (userRole !== 'dev') {
        throw new Error('No tienes permiso para crear inmobiliarias');
      }

      // Preparar datos para inserción
      const { facebook, instagram, linkedin } = values;
      const inmobi_info: InmobiliariaInfo = {
        direccion: values.direccion || '',
        sitio_web: values.sitio_web || '',
        email_contacto: values.email_contacto || '',
        telefono_oficina: values.telefono_oficina || '',
        horario_atencion: values.horario_atencion || '',
        descripcion: values.descripcion || '',
        redes_sociales: {
          facebook: facebook || '',
          instagram: instagram || '',
          linkedin: linkedin || ''
        }
      };

      // Insertar en la base de datos
      const { error } = await supabase
        .from('inmobiliarias')
        .insert([{
          nombre: values.nombre,
          activo: values.activo,
          whatsapp_chatbot: values.whatsapp_chatbot || '',
          inmobi_info
        }]);

      if (error) throw error;

      message.success('Inmobiliaria creada correctamente');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchInmobiliarias();
    } catch (error: any) {
      message.error(`Error al crear inmobiliaria: ${error.message || 'Error desconocido'}`);
      console.error('Error al crear inmobiliaria:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Editar inmobiliaria
  const handleEdit = (record: Inmobiliaria) => {
    setEditingRecord(record);
    setEditModalVisible(true);
    
    // Resetear y establecer valores del formulario
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({
        nombre: record.nombre,
        activo: record.activo,
        whatsapp_chatbot: record.whatsapp_chatbot || '',
        direccion: record.inmobi_info?.direccion || '',
        sitio_web: record.inmobi_info?.sitio_web || '',
        email_contacto: record.inmobi_info?.email_contacto || '',
        telefono_oficina: record.inmobi_info?.telefono_oficina || '',
        horario_atencion: record.inmobi_info?.horario_atencion || '',
        descripcion: record.inmobi_info?.descripcion || '',
        facebook: record.inmobi_info?.redes_sociales?.facebook || '',
        instagram: record.inmobi_info?.redes_sociales?.instagram || '',
        linkedin: record.inmobi_info?.redes_sociales?.linkedin || ''
      });
    }, 300);
  };

  // Enviar edición
  const handleEditSubmit = async (values: InmobiliariaFormData) => {
    if (!editingRecord) {
      message.error('No se ha seleccionado ninguna inmobiliaria para editar');
      return;
    }
    
    setSubmitting(true);
    try {
      // Verificar permisos
      const { user, userRole } = await checkUserPermissions();
      
      // Verificar si el usuario tiene permiso para editar esta inmobiliaria
      if (userRole === 'admin' && user?.app_metadata?.inmobiliaria_id !== editingRecord.id) {
        throw new Error('No tienes permiso para editar esta inmobiliaria');
      }

      // Preparar datos para actualización
      const { facebook, instagram, linkedin } = values;
      const inmobi_info: InmobiliariaInfo = {
        direccion: values.direccion || '',
        sitio_web: values.sitio_web || '',
        email_contacto: values.email_contacto || '',
        telefono_oficina: values.telefono_oficina || '',
        horario_atencion: values.horario_atencion || '',
        descripcion: values.descripcion || '',
        redes_sociales: {
          facebook: facebook || '',
          instagram: instagram || '',
          linkedin: linkedin || ''
        }
      };

      // Actualizar en la base de datos
      const { error } = await supabase
        .from('inmobiliarias')
        .update({
          nombre: values.nombre,
          activo: values.activo,
          whatsapp_chatbot: values.whatsapp_chatbot || '',
          inmobi_info
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      message.success('Inmobiliaria actualizada correctamente');
      setEditModalVisible(false);
      fetchInmobiliarias();
    } catch (error: any) {
      message.error(`Error al actualizar inmobiliaria: ${error.message || 'Error desconocido'}`);
      console.error('Error al actualizar inmobiliaria:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Mostrar detalles
  const handleShowDetails = (record: Inmobiliaria) => {
    setSelectedRecord(record);
    setDetailsVisible(true);
  };

  // Eliminar inmobiliaria
  const handleDelete = async (id: string) => {
    try {
      // Verificar permisos
      const { userRole } = await checkUserPermissions();
      
      // Solo usuarios con rol 'dev' pueden eliminar inmobiliarias
      if (userRole !== 'dev') {
        throw new Error('No tienes permiso para eliminar inmobiliarias');
      }

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('inmobiliarias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      message.success('Inmobiliaria eliminada correctamente');
      fetchInmobiliarias();
    } catch (error: any) {
      message.error(`Error al eliminar inmobiliaria: ${error.message || 'Error desconocido'}`);
      console.error('Error al eliminar inmobiliaria:', error);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchInmobiliarias();
  }, [fetchInmobiliarias]);

  // Definición de columnas para la tabla
  const columns: ColumnsType<Inmobiliaria> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (text, record) => (
        <Space>
          <a onClick={() => handleShowDetails(record)}>{text}</a>
          {record.whatsapp_chatbot && (
            <Tooltip title="Tiene WhatsApp Chatbot">
              <WhatsAppOutlined style={{ color: '#25D366' }} />
            </Tooltip>
          )}
          {record.inmobi_info?.sitio_web && (
            <Tooltip title="Tiene Sitio Web">
              <GlobalOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Badge 
          status={activo ? 'success' : 'error'} 
          text={activo ? 'Activo' : 'Inactivo'} 
        />
      ),
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value, record) => record.activo === value,
    },
    {
      title: 'Información',
      key: 'info',
      render: (_, record) => {
        const infoCount = Object.keys(record.inmobi_info || {}).filter(key => 
          record.inmobi_info?.[key as keyof InmobiliariaInfo]
        ).length;
        
        return (
          <Tooltip title="Campos de información completados">
            <Badge count={infoCount} style={{ backgroundColor: '#52c41a' }} />
          </Tooltip>
        );
      },
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
            icon={<InfoCircleOutlined />}
            onClick={() => handleShowDetails(record)}
          >
            Detalles
          </Button>
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

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '24px' }}>Inmobiliarias</Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Nueva Inmobiliaria
            </Button>
          </div>
        }
      >
        <Table<Inmobiliaria>
          columns={columns}
          dataSource={inmobiliarias}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} inmobiliarias`,
          }}
        />
      </Card>

      {/* Modal para crear nueva inmobiliaria */}
      <Modal
        title="Nueva Inmobiliaria"
        open={createModalVisible}
        width={800}
        onOk={() => createForm.submit()}
        okText="Crear"
        cancelText="Cancelar"
        okButtonProps={{
          loading: submitting,
          type: 'primary'
        }}
        cancelButtonProps={{
          disabled: submitting
        }}
        onCancel={() => {
          if (createForm.isFieldsTouched()) {
            Modal.confirm({
              title: '¿Estás seguro de que deseas cancelar?',
              content: 'Los cambios no guardados se perderán.',
              okText: 'Sí',
              cancelText: 'No',
              onOk: () => {
                setCreateModalVisible(false);
                createForm.resetFields();
              }
            });
          } else {
            setCreateModalVisible(false);
            createForm.resetFields();
          }
        }}
        destroyOnClose
        maskClosable={false}
      >
        <Form<InmobiliariaFormData>
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            activo: true,
            nombre: '',
            whatsapp_chatbot: '',
            direccion: '',
            sitio_web: '',
            email_contacto: '',
            telefono_oficina: '',
            horario_atencion: '',
            descripcion: '',
            facebook: '',
            instagram: '',
            linkedin: ''
          }}
          preserve={false}
        >
          <FormContent />
        </Form>
      </Modal>

      {/* Modal para editar inmobiliaria */}
      <Modal
        title="Editar Inmobiliaria"
        open={editModalVisible}
        width={800}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        okButtonProps={{
          loading: submitting,
          type: 'primary'
        }}
        cancelButtonProps={{
          disabled: submitting
        }}
        onCancel={() => {
          if (form.isFieldsTouched()) {
            Modal.confirm({
              title: '¿Estás seguro de que deseas cancelar?',
              content: 'Los cambios no guardados se perderán.',
              okText: 'Sí',
              cancelText: 'No',
              onOk: () => {
                setEditModalVisible(false);
                form.resetFields();
              }
            });
          } else {
            setEditModalVisible(false);
            form.resetFields();
          }
        }}
        destroyOnClose
        maskClosable={false}
      >
        <Form<InmobiliariaFormData>
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          preserve={false}
        >
          <FormContent />
        </Form>
      </Modal>

      {/* Modal para ver detalles */}
      <Modal
        title="Detalles de la Inmobiliaria"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Nombre">
              {selectedRecord.nombre}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Badge 
                status={selectedRecord.activo ? 'success' : 'error'} 
                text={selectedRecord.activo ? 'Activo' : 'Inactivo'} 
              />
            </Descriptions.Item>
            {selectedRecord.whatsapp_chatbot && (
              <Descriptions.Item label="WhatsApp Chatbot">
                {selectedRecord.whatsapp_chatbot}
              </Descriptions.Item>
            )}
            {selectedRecord.inmobi_info?.direccion && (
              <Descriptions.Item label="Dirección">
                {selectedRecord.inmobi_info.direccion}
              </Descriptions.Item>
            )}
            {selectedRecord.inmobi_info?.sitio_web && (
              <Descriptions.Item label="Sitio Web">
                <a href={selectedRecord.inmobi_info.sitio_web} target="_blank" rel="noopener noreferrer">
                  {selectedRecord.inmobi_info.sitio_web}
                </a>
              </Descriptions.Item>
            )}
            {selectedRecord.inmobi_info?.email_contacto && (
              <Descriptions.Item label="Email de Contacto">
                {selectedRecord.inmobi_info.email_contacto}
              </Descriptions.Item>
            )}
            {selectedRecord.inmobi_info?.telefono_oficina && (
              <Descriptions.Item label="Teléfono de Oficina">
                {selectedRecord.inmobi_info.telefono_oficina}
              </Descriptions.Item>
            )}
            {selectedRecord.inmobi_info?.horario_atencion && (
              <Descriptions.Item label="Horario de Atención">
                {selectedRecord.inmobi_info.horario_atencion}
              </Descriptions.Item>
            )}
            {selectedRecord.inmobi_info?.descripcion && (
              <Descriptions.Item label="Descripción">
                {selectedRecord.inmobi_info.descripcion}
              </Descriptions.Item>
            )}
            {(selectedRecord.inmobi_info?.redes_sociales?.facebook ||
              selectedRecord.inmobi_info?.redes_sociales?.instagram ||
              selectedRecord.inmobi_info?.redes_sociales?.linkedin) && (
              <Descriptions.Item label="Redes Sociales">
                <Space direction="vertical">
                  {selectedRecord.inmobi_info?.redes_sociales?.facebook && (
                    <a href={selectedRecord.inmobi_info.redes_sociales.facebook} target="_blank" rel="noopener noreferrer">
                      Facebook
                    </a>
                  )}
                  {selectedRecord.inmobi_info?.redes_sociales?.instagram && (
                    <a href={selectedRecord.inmobi_info.redes_sociales.instagram} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  )}
                  {selectedRecord.inmobi_info?.redes_sociales?.linkedin && (
                    <a href={selectedRecord.inmobi_info.redes_sociales.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};