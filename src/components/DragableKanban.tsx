import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DroppableStateSnapshot,
  DraggableStateSnapshot
} from 'react-beautiful-dnd';
import { Card, Space, Tag, Typography, Tooltip, Button, Row, Col } from 'antd';
import { WhatsAppOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface Prospect {
  id: string;
  nombre: string;
  etapa: string;
  numero_whatsapp: string;
  proyecto_interesado: string;
  fecha_proximo_seguimiento: string;
  cantidad_seguimientos: number;
  inmobiliaria_id: string;
  inmobiliaria?: {
    nombre: string;
  };
  created_at: string;
  updated_at: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  icon: string;
  items: Prospect[];
}

interface KanbanProps {
  prospects: Prospect[];
  onDragEnd: (result: DropResult) => void;
  onViewDetails?: (prospect: Prospect) => void;
}

const etapas = [
  { id: 'Nuevo prospecto', title: 'Nuevos', color: 'green', icon: '🆕' },
  { id: 'Conversación', title: 'En Conversación', color: 'orange', icon: '💬' },
  { id: 'Calificado', title: 'Calificados', color: 'blue', icon: '✅' },
  { id: 'No calificado', title: 'No Calificados', color: 'red', icon: '❌' },
  { id: 'Agendado', title: 'Agendados', color: 'purple', icon: '📅' },
  { id: 'No interesado', title: 'No Interesados', color: 'gray', icon: '⛔' },
];

export const DragableKanban: React.FC<KanbanProps> = ({ prospects, onDragEnd, onViewDetails }) => {
  // Organizar prospectos por columnas
  const columns = etapas.reduce((acc, etapa) => {
    acc[etapa.id] = {
      ...etapa,
      items: prospects.filter(p => p.etapa === etapa.id),
    };
    return acc;
  }, {} as Record<string, Column>);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Row gutter={[16, 16]} style={{ overflowX: 'auto', padding: '8px' }}>
        {etapas.map((etapa) => (
          <Col key={etapa.id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <Droppable droppableId={etapa.id}>
              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: snapshot.isDraggingOver ? '#f0f0f0' : '#ffffff',
                    padding: 8,
                    minHeight: 500,
                    borderRadius: 8,
                    border: '1px solid #d9d9d9',
                  }}
                >
                  <div style={{ 
                    marginBottom: 16,
                    padding: '8px',
                    background: '#fafafa',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Space>
                      <Text>{etapa.icon}</Text>
                      <Text strong>{etapa.title}</Text>
                    </Space>
                    <Tag color={etapa.color}>
                      {columns[etapa.id].items.length}
                    </Tag>
                  </div>

                  {columns[etapa.id].items.map((prospect, index) => (
                    <Draggable
                      key={prospect.id}
                      draggableId={prospect.id}
                      index={index}
                    >
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          size="small"
                          style={{
                            marginBottom: 8,
                            cursor: 'pointer',
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none',
                            backgroundColor: snapshot.isDragging ? '#fafafa' : '#ffffff',
                          }}
                          onClick={() => onViewDetails && onViewDetails(prospect)}
                        >
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center'
                            }}>
                              <Text strong style={{ fontSize: '14px' }}>{prospect.nombre}</Text>
                              <Tooltip title={prospect.inmobiliaria?.nombre}>
                                <TeamOutlined />
                              </Tooltip>
                            </div>
                            
                            <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: '12px', margin: 0 }}>
                              {prospect.proyecto_interesado}
                            </Paragraph>

                            <Space split="·" style={{ fontSize: '12px' }}>
                              <Tooltip title="Contactar por WhatsApp">
                                <Button
                                  type="link"
                                  icon={<WhatsAppOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`https://wa.me/${prospect.numero_whatsapp}`, '_blank');
                                  }}
                                  size="small"
                                  style={{ padding: 0 }}
                                />
                              </Tooltip>
                              <Tooltip title="Próximo seguimiento">
                                <Space size="small" style={{ color: '#666' }}>
                                  <CalendarOutlined />
                                  {prospect.fecha_proximo_seguimiento 
                                    ? new Date(prospect.fecha_proximo_seguimiento).toLocaleDateString()
                                    : 'No programado'
                                  }
                                </Space>
                              </Tooltip>
                            </Space>
                          </Space>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Col>
        ))}
      </Row>
    </DragDropContext>
  );
};

export default DragableKanban;