import React from 'react';
import { DatePicker, Form, Input } from 'antd';
import CheckableTag from './CheckableTag';
import TextArea from 'antd/lib/input/TextArea';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { CardTags, ICard } from '../models';

const tagsData: CardTags[] = ['SEO', 'Long Form', 'Blog Post'];

interface IProps {
  form: FormInstance<ICard>;
  disabled?: boolean;
}

const CardForm: React.FC<IProps> = ({ form, disabled }) => {
  return (
    <div className="card-form">
      <Form
        disabled={disabled}
        form={form}
        autoComplete="off"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please input the title!' }]}
        >
          <Input/>
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <TextArea disabled={disabled}/>
        </Form.Item>
        <Form.Item
          label="Tags"
          name="tags"
        >
          <CheckableTag dataSource={tagsData} disabled={disabled}/>
        </Form.Item>
        <Form.Item
          label="Due date"
          name="dueDateObj"
        >
          <DatePicker style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}

export default CardForm;
