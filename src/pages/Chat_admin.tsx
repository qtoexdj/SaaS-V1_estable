import { FC, useState } from 'react';
import { Typography, Space, Grid, theme, Input, List, Avatar, Badge, Card, Button, Row, Col } from 'antd';
import { MessageOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isAdmin: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export const ChatAdmin: FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();

  // Datos de ejemplo
  const mockContacts: ChatContact[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      lastMessage: '¿Cuándo podemos agendar una visita?',
      timestamp: '14:30',
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'María González',
      lastMessage: 'Gracias por la información',
      timestamp: '12:45',
      unreadCount: 0,
    },
  ];

  return (
    <div style={{ margin: '0px' }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: 24 }}>
        <Space>
          <MessageOutlined />
          {screens.xs ? 'Chat' : 'Centro de Mensajes'}
        </Space>
      </Title>

      <Row gutter={[24, 24]}>
        {/* Lista de Contactos */}
        <Col xs={24} sm={8} md={8} lg={6}>
          <Card>
            <Search
              placeholder="Buscar chat..."
              style={{ marginBottom: 16 }}
            />
            <List
              dataSource={mockContacts}
              renderItem={(contact) => (
                <List.Item
                  onClick={() => setSelectedChat(contact.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedChat === contact.id ? token.colorBgTextHover : 'transparent',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text strong>{contact.name}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {contact.timestamp}
                        </Text>
                      </Space>
                    }
                    description={
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text type="secondary" ellipsis style={{ maxWidth: '180px' }}>
                          {contact.lastMessage}
                        </Text>
                        {contact.unreadCount > 0 && (
                          <Badge count={contact.unreadCount} />
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Área de Chat */}
        <Col xs={24} sm={16} md={16} lg={18}>
          <Card>
            {selectedChat ? (
              <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
                  {/* Área de mensajes */}
                  <Text type="secondary">Selecciona un mensaje para ver la conversación</Text>
                </div>
                <Input.Group compact style={{ display: 'flex' }}>
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button 
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => {
                      if (messageInput.trim()) {
                        setMessageInput('');
                      }
                    }}
                  >
                    Enviar
                  </Button>
                </Input.Group>
              </div>
            ) : (
              <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">Selecciona un chat para comenzar</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ChatAdmin;