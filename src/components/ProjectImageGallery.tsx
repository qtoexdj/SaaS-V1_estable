import React, { useState } from 'react';
import { Image, Empty } from 'antd';
import { ProjectImage } from '../types/project';

interface ProjectImageGalleryProps {
  images: ProjectImage[];
}

/**
 * Componente para mostrar una galería de imágenes de un proyecto
 * Permite ver las imágenes en tamaño completo al hacer clic
 */
const ProjectImageGallery: React.FC<ProjectImageGalleryProps> = ({ images }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <Empty description="No hay imágenes disponibles" />;
  }

  return (
    <div className="project-image-gallery">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {images.map((image, index) => (
          <div 
            key={image.id} 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setCurrentIndex(index);
              setVisible(true);
            }}
          >
            <img 
              src={image.url} 
              alt={`Proyecto ${index + 1}`} 
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'cover',
                borderRadius: '4px'
              }} 
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible,
            onVisibleChange: (vis) => setVisible(vis),
            current: currentIndex,
            countRender: (current, total) => `${current} / ${total}`
          }}
        >
          {images.map((image) => (
            <Image key={image.id} src={image.url} />
          ))}
        </Image.PreviewGroup>
      </div>
    </div>
  );
};

export default ProjectImageGallery;