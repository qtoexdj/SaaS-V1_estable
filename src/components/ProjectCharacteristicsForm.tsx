import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';

interface ProjectCharacteristicsFormProps {
  form: FormInstance;
}

const ProjectCharacteristicsForm: React.FC<ProjectCharacteristicsFormProps> = () => {
  return (
    <Form.List name="caracteristicas">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name }) => (
            <Space key={key} align="baseline">
              <Form.Item
                name={[name, 'key']}
                rules={[{ required: true, message: 'Ingrese la característica' }]}
              >
                <Input placeholder="Ej: habitaciones" />
              </Form.Item>
              <Form.Item
                name={[name, 'value']}
                rules={[{ required: true, message: 'Ingrese el valor' }]}
              >
                <Input placeholder="Ej: 3" />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button 
              type="dashed" 
              onClick={() => add()} 
              block
              icon={<PlusOutlined />}
            >
              Agregar característica
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default ProjectCharacteristicsForm;