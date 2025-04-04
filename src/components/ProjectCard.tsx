import React from 'react';
import { Card, Space, Typography, Button, Tooltip, Image, Popconfirm, List } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  FileImageOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Project } from '../types/project';

const { Text, Paragraph } = Typography;

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onViewImages: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onViewImages }) => {
  const coverImage = project.images && project.images[0]?.url;
  
  return (
    <Card
        hoverable
        className="project-card"
        cover={
          coverImage ? (
            <div style={{ height: 200, overflow: 'hidden' }}>
              <Image
                alt={project.caracteristicas.nombre}
                src={coverImage}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                preview={{ 
                  mask: <div><FileImageOutlined /> Ver Imagen</div>,
                  maskClassName: 'custom-mask'
                }}
              />
            </div>
          ) : (
            <div style={{ 
              height: 200, 
              background: '#f5f5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <HomeOutlined style={{ fontSize: 48, color: '#999' }} />
            </div>
          )
        }
        actions={[
          <Tooltip title="Editar" key="edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(project)}
            />
          </Tooltip>,
          <Tooltip title="Ver Imágenes" key="images">
            <Button 
              type="text" 
              icon={<PictureOutlined />} 
              disabled={!project.images?.length}
              onClick={() => onViewImages(project)}
            />
          </Tooltip>,
          <Popconfirm
            key="delete"
            title="¿Eliminar proyecto?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => onDelete(project.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ]}
      >
        <Card.Meta
          title={project.caracteristicas.nombre}
          description={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <EnvironmentOutlined style={{ marginRight: 8 }} />
                  <Text>{project.caracteristicas.ubicacion}</Text>
                </div>
                {project.caracteristicas.valor && (
                  <div>
                    <Text strong>Valor:</Text> <Text>{project.caracteristicas.valor}</Text>
                  </div>
                )}
                {project.caracteristicas.caracteristicas && (
                  <div>
                    <Text type="secondary">{project.caracteristicas.caracteristicas}</Text>
                  </div>
                )}
              </Space>
            </Space>
          }
        />
      </Card>
  );
};

export default ProjectCard;