import { FC, useState } from 'react';
import { Layout, Typography, Space, Grid, theme, Input, List, Avatar, Badge, Card, Button } from 'antd';
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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      gap: token.padding 
    }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: token.marginLG 
      }}>
        <Title
          level={screens.xs ? 5 : 4}
          style={{
            margin: 0,
            fontSize: screens.xs ? '16px' : undefined
          }}
        >
          <Space size={screens.xs ? 'small' : 'middle'}>
            <MessageOutlined />
            {screens.xs ? 'Chat' : 'Centro de Mensajes'}
          </Space>
        </Title>
      </div>

      <Card
        style={{
          flex: 1,
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          height: 'calc(100vh - 180px)',
          display: 'flex',
          flexDirection: 'column'
        }}
        bodyStyle={{ 
          height: '100%', 
          padding: 0,
          display: 'flex'
        }}
      >
        <Layout style={{ flex: 1, backgroundColor: 'transparent' }}>
          <Layout.Sider
            width={300}
            theme="light"
            style={{
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              height: '100%',
              overflow: 'auto'
            }}
          >
            <div style={{ padding: token.padding }}>
              <Search
                placeholder="Buscar chat..."
                style={{ marginBottom: token.margin }}
              />
              <List
                dataSource={mockContacts}
                renderItem={(contact) => (
                  <List.Item
                    onClick={() => setSelectedChat(contact.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedChat === contact.id ? token.colorBgTextHover : 'transparent',
                      padding: token.padding,
                      borderRadius: token.borderRadius
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
                style={{
                  maxHeight: 'calc(100vh - 240px)',
                  overflowY: 'auto'
                }}
              />
            </div>
          </Layout.Sider>
          
          <Layout.Content style={{ 
            padding: token.padding,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            {selectedChat ? (
              <>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: token.padding,
                  marginBottom: token.margin
                }}>
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
              </>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text type="secondary">Selecciona un chat para comenzar</Text>
              </div>
            )}
          </Layout.Content>
        </Layout>
      </Card>
    </div>
  );
};

export default ChatAdmin;