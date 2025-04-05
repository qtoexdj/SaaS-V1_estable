import { FC } from 'react';
import { Typography, Card, Row, Col, Button, Space } from 'antd';
import { QuestionCircleOutlined, MailOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const Support: FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>
        <Space>
          <QuestionCircleOutlined />
          Ayuda y Soporte
        </Space>
      </Title>

      <Row gutter={[24, 24]}>
        {/* Contacto Directo */}
        <Col xs={24} md={12}>
          <Card>
            <Title level={4}>Contacto Directo</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space>
                <MailOutlined />
                <Text strong>Email:</Text>
                <Text>soporte@company.com</Text>
              </Space>
              <Space>
                <PhoneOutlined />
                <Text strong>Teléfono:</Text>
                <Text>+56 2 2123 4567</Text>
              </Space>
              <Space>
                <MessageOutlined />
                <Text strong>Horario de Atención:</Text>
                <Text>Lunes a Viernes 9:00 - 18:00</Text>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* FAQ */}
        <Col xs={24} md={12}>
          <Card>
            <Title level={4}>Preguntas Frecuentes</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Paragraph strong>¿Cómo puedo cambiar mi contraseña?</Paragraph>
                <Paragraph>
                  Dirígete a tu perfil y en la sección de seguridad encontrarás la opción para cambiar tu contraseña.
                </Paragraph>
              </div>
              <div>
                <Paragraph strong>¿Cómo gestiono mis notificaciones?</Paragraph>
                <Paragraph>
                  En la sección de configuración de tu perfil podrás personalizar tus preferencias de notificaciones.
                </Paragraph>
              </div>
              <div>
                <Paragraph strong>¿Necesitas más ayuda?</Paragraph>
                <Button type="primary">
                  Contactar Soporte
                </Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Support;