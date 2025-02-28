import React, { useState } from 'react';
import { Upload, message, Modal, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadProjectImage, deleteProjectImage } from '../services/projectImages';
import { ProjectImage } from '../types/project';

interface ProjectImageUploaderProps {
  projectId: string;
  existingImages: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
  disabled?: boolean;
}

/**
 * Componente para subir y gestionar imágenes de proyectos
 * Permite subir hasta 5 imágenes por proyecto
 */
const ProjectImageUploader: React.FC<ProjectImageUploaderProps> = ({
  projectId,
  existingImages,
  onImagesChange,
  disabled = false
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(
    existingImages.map(img => ({
      uid: img.id,
      name: img.storage_path.split('/').pop() || '',
      status: 'done',
      url: img.url,
      response: img
    }))
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || '');
    setPreviewOpen(true);
    setPreviewTitle(file.name || '');
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    if (fileList.length >= 5) {
      message.error('Máximo 5 imágenes por proyecto');
      return;
    }

    setUploading(true);
    
    try {
      // Simular progreso
      const interval = setInterval(() => {
        onProgress({ percent: Math.random() * 100 });
      }, 200);
      
      const newImage = await uploadProjectImage(projectId, file);
      
      clearInterval(interval);
      onSuccess(newImage);
      
      // Actualizar la lista de imágenes
      const updatedImages = [...existingImages, newImage];
      onImagesChange(updatedImages);
      
      message.success('Imagen subida correctamente');
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      onError(error);
      message.error(`Error al subir imagen: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (file: UploadFile) => {
    try {
      const image = file.response as ProjectImage;
      
      if (image && image.id) {
        await deleteProjectImage(projectId, image.id, image.storage_path);
        
        // Actualizar la lista de imágenes
        const updatedImages = existingImages.filter(img => img.id !== image.id);
        onImagesChange(updatedImages);
        
        message.success('Imagen eliminada correctamente');
      }
      return true;
    } catch (error: any) {
      console.error('Error al eliminar imagen:', error);
      message.error(`Error al eliminar imagen: ${error.message}`);
      return false;
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Subir</div>
    </div>
  );

  return (
    <div className="project-image-uploader">
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customRequest}
        onRemove={handleRemove}
        accept=".jpg,.jpeg,.png,.webp"
        disabled={disabled || uploading || fileList.length >= 5}
      >
        {fileList.length >= 5 ? null : uploadButton}
      </Upload>
      
      {uploading && <Spin tip="Subiendo..." />}
      
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      
      <div style={{ marginTop: 8 }}>
        <small>Máximo 5 imágenes por proyecto (jpg, jpeg, png, webp)</small>
        <br />
        <small>Tamaño máximo: 2MB por imagen</small>
      </div>
    </div>
  );
};

export default ProjectImageUploader;