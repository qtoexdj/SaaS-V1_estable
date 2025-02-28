import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Switch, Button, message } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';

interface InmobiliariaData {
  id: string;
  nombre: string;
  activo: boolean;
  whatsapp_chatbot: string;
  inmobi_info: {
    direccion?: string;
    sitio_web?: string;
    email_contacto?: string;
    telefono_oficina?: string;
    horario_atencion?: string;
    descripcion?: string;
    redes_sociales?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
}

const Inmobiliaria_admin: React.FC = () => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [, setInmobiliariaData] = useState<InmobiliariaData | null>(null);

  useEffect(() => {
    fetchInmobiliariaData();
  }, [user]);

  const fetchInmobiliariaData = async () => {
    try {
      if (!user?.app_metadata?.inmobiliaria_id) {
        message.error('No se encontró una inmobiliaria asociada');
        return;
      }

      const { data, error } = await supabase
        .from('inmobiliarias')
        .select('*')
        .eq('id', user.app_metadata.inmobiliaria_id)
        .single();

      if (error) throw error;

      setInmobiliariaData(data);
      form.setFieldsValue({
        nombre: data.nombre,
        activo: data.activo,
        whatsapp_chatbot: data.whatsapp_chatbot,
        ...data.inmobi_info,
        facebook: data.inmobi_info?.redes_sociales?.facebook || '',
        instagram: data.inmobi_info?.redes_sociales?.instagram || '',
        linkedin: data.inmobi_info?.redes_sociales?.linkedin || ''
      });
    } catch (error: any) {
      message.error('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      const {
        nombre, activo, whatsapp_chatbot,
        facebook, instagram, linkedin,
        ...infoFields
      } = values;

      const inmobi_info = {
        ...infoFields,
        redes_sociales: {
          facebook,
          instagram,
          linkedin
        }
      };

      const { error } = await supabase
        .from('inmobiliarias')
        .update({
          nombre,
          activo,
          whatsapp_chatbot,
          inmobi_info
        })
        .eq('id', user?.app_metadata?.inmobiliaria_id);

      if (error) throw error;

      message.success('Datos actualizados correctamente');
      await fetchInmobiliariaData();
    } catch (error: any) {
      message.error('Error al actualizar los datos: ' + error.message);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Card title="Perfil de la Inmobiliaria" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="nombre"
          label="Nombre de la Inmobiliaria"
          rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
        >
          <Input />
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

        <Card type="inner" title="Información de Contacto" style={{ marginBottom: 24 }}>
          <Form.Item
            name="direccion"
            label="Dirección"
          >
            <Input placeholder="Av. Principal 123, Ciudad" />
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
            <Input placeholder="https://www.ejemplo.com" />
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
            <Input placeholder="contacto@ejemplo.com" />
          </Form.Item>

          <Form.Item
            name="telefono_oficina"
            label="Teléfono de Oficina"
          >
            <Input placeholder="+56 2 2345 6789" />
          </Form.Item>
        </Card>

        <Card type="inner" title="Información Adicional" style={{ marginBottom: 24 }}>
          <Form.Item
            name="horario_atencion"
            label="Horario de Atención"
          >
            <Input.TextArea
              rows={2}
              placeholder="Lunes a Viernes: 9:00 - 18:00&#10;Sábado: 10:00 - 14:00"
            />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción de la Inmobiliaria"
          >
            <Input.TextArea
              rows={4}
              placeholder="Breve descripción de la inmobiliaria, su historia, especialidad, etc."
            />
          </Form.Item>
        </Card>

        <Card type="inner" title="Redes Sociales" style={{ marginBottom: 24 }}>
          <Form.Item
            name="facebook"
            label="Facebook"
          >
            <Input placeholder="URL de Facebook" />
          </Form.Item>

          <Form.Item
            name="instagram"
            label="Instagram"
          >
            <Input placeholder="URL de Instagram" />
          </Form.Item>

          <Form.Item
            name="linkedin"
            label="LinkedIn"
          >
            <Input placeholder="URL de LinkedIn" />
          </Form.Item>
        </Card>

        <Form.Item
          name="activo"
          label="Activo"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Guardar Cambios
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Inmobiliaria_admin;