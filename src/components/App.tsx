import React, { useState } from 'react';
import Board from './Board';
import { Button, Form, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CardForm from './CardForm';

export const App: React.FC = () => {
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [form] = Form.useForm();

  return (
    <div className="app">
      <Button
        type="primary"
        icon={<PlusOutlined/>}
        onClick={_ => {
          form.resetFields();
          setModalOpened(true);
        }}
      >Add new</Button>
      <br/><br/>
      <Board/>

      <Modal
        maskClosable={false}
        open={modalOpened}
        title="New To do"
        onCancel={_ => {
          setModalOpened(false);
        }}
        onOk={_ => {
          form.validateFields().then(values => {
            console.log(values);
            setModalOpened(false);
          })
        }}
      >
        <CardForm form={form} />
      </Modal>
    </div>
  );
}

export default App;
