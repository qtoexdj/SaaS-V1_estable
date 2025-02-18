import React, { useState } from 'react';
import { Layout, List, Input, Button, Avatar, Typography, Card, Space } from 'antd';
import { SendOutlined, PaperClipOutlined, SmileOutlined, EllipsisOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Sider, Content } = Layout;
const { Search } = Input;
const { Text } = Typography;

interface ChatMessage {
  id: string;
  text: string;
  isMe: boolean;
  timestamp: string;
}

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    lastMessage: 'Me interesa el departamento...',
    timestamp: '10:30',
    unread: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
  },
  {
    id: '2',
    name: 'María González',
    lastMessage: '¿Cuál es el precio?',
    timestamp: '09:45',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
  },
  // Agrega más contactos mock aquí
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    text: 'Hola, me interesa el departamento que vi en el anuncio',
    isMe: false,
    timestamp: '10:30'
  },
  {
    id: '2',
    text: '¡Hola! Claro, te puedo dar más información. ¿Qué te gustaría saber específicamente?',
    isMe: true,
    timestamp: '10:31'
  },
  {
    id: '3',
    text: '¿Cuál es el precio y la ubicación exacta?',
    isMe: false,
    timestamp: '10:32'
  },
  {
    id: '4',
    text: 'El precio es $150,000 y está ubicado en el centro de la ciudad, cerca de la plaza principal',
    isMe: true,
    timestamp: '10:33'
  },
];

const Chat_admin: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <Layout style={{
      height: 'calc(100vh - 120px)',
      background: '#fff',
      margin: '-24px',
      display: 'flex',
      overflow: 'hidden'
    }}>
      <Sider width={350} style={{ background: '#f0f2f5', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Space direction="vertical" style={{ width: '100%', display: 'flex', flexDirection: 'column' }} size="small">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
              <Avatar size={40} src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} />
              <div style={{ marginLeft: 'auto' }}>
                <Button type="text" icon={<EllipsisOutlined />} />
              </div>
            </div>

            {/* Search */}
            <Search
              placeholder="Buscar o empezar un nuevo chat"
              allowClear
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Space>

            {/* Contacts List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                marginTop: '8px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={mockContacts}
                style={{ height: '100%', overflow: 'visible' }}
                renderItem={contact => (
                  <Card
                  style={{
                    marginBottom: '1px',
                    cursor: 'pointer',
                    background: selectedContact?.id === contact.id ? '#e9edef' : '#fff'
                  }}
                  bodyStyle={{ padding: '12px' }}
                  onClick={() => setSelectedContact(contact)}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={contact.avatar} size={48} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>{contact.name}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {contact.timestamp}
                        </Text>
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {contact.lastMessage}
                        </Text>
                        {contact.unread > 0 && (
                          <div
                            style={{
                              background: '#25D366',
                              color: 'white',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}
                          >
                            {contact.unread}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              )}
            />
          </div>
        </div>
      </Sider>

      <Content style={{
        background: '#efeae2',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '10px 16px',
              background: '#f0f2f5',
              borderLeft: '1px solid #d1d7db',
              display: 'flex',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <Avatar src={selectedContact.avatar} size={40} />
              <div style={{ marginLeft: '15px' }}>
                <Text strong style={{ fontSize: '16px' }}>{selectedContact.name}</Text>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Space>
                  <Button type="text" icon={<SearchOutlined />} />
                  <Button type="text" icon={<EllipsisOutlined />} />
                </Space>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              padding: '20px',
              flex: 1,
              overflowY: 'auto',
              minHeight: 0, // Importante para que flex: 1 funcione correctamente
              display: 'flex',
              flexDirection: 'column-reverse' // Para que el scroll empiece desde abajo
            }}>
              {mockMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.isMe ? 'flex-end' : 'flex-start',
                    marginBottom: '10px'
                  }}
                >
                  <div
                    style={{
                      background: msg.isMe ? '#dcf8c6' : '#fff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      maxWidth: '60%',
                      position: 'relative'
                    }}
                  >
                    <Text>{msg.text}</Text>
                    <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                      {msg.timestamp}
                    </Text>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div style={{
              padding: '10px',
              background: '#f0f2f5',
              borderTop: '1px solid #d1d7db',
              marginTop: 'auto', // Empuja la barra de entrada al fondo
              position: 'sticky',
              bottom: 0,
              zIndex: 1
            }}>
              <Space.Compact style={{ width: '100%' }}>
                <Button icon={<SmileOutlined />} />
                <Button icon={<PaperClipOutlined />} />
                <Input
                  placeholder="Escribe un mensaje aquí"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onPressEnter={handleSend}
                />
                <Button icon={<SendOutlined />} onClick={handleSend} />
              </Space.Compact>
            </div>
          </>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#54656f'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>
              WhatsApp Web
            </div>
            <Text type="secondary">
              Selecciona un chat para comenzar la conversación
            </Text>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Chat_admin;