import React, { useState } from 'react';
import Board from './Board';
import { Affix, Button, Divider, Form, Modal } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import CardForm from './CardForm';
import { ICard } from '../models';

const { confirm } = Modal;

const data: ReactTrello.BoardData = {
  lanes: [
    {
      id: 'lane1',
      title: 'To do',
      label: '2/2',
      cards: [
        { id: 'Card1', title: 'Write Blog', description: 'Can AI make memes', label: '30 mins', draggable: false },
        {
          id: 'Card2',
          title: 'Pay Rent',
          description: 'Transfer via NEFT',
          label: '5 mins',
          metadata: { sha: 'be312a1' }
        }
      ]
    },
    {
      id: 'lane2',
      title: 'In progress',
      label: '0/0',
      cards: []
    },
    {
      id: 'lane3',
      title: 'Done',
      label: '2/2',
      cards: [
        { id: 'Card1', title: 'Write Blog', description: 'Can AI make memes', label: '30 mins', draggable: false },
        {
          id: 'Card2',
          title: 'Pay Rent',
          description: 'Transfer via NEFT',
          label: '5 mins',
          metadata: { sha: 'be312a1' }
        }
      ]
    },
  ]
}

export const App: React.FC = () => {
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [form] = Form.useForm<ICard>();

  return (
    <div className="app">
      <Affix offsetTop={10}>
        <Button
          type="primary"
          icon={<PlusOutlined/>}
          onClick={_ => {
            form.resetFields();
            setModalOpened(true);
          }}
        >Add new</Button>
      </Affix>

      <Divider/>

      <Board
        data={{ ...data }}
        onBeforeCardDelete={cb => {
          confirm({
            title: 'Do you want to delete this item?',
            icon: <ExclamationCircleFilled/>,
            onOk: async () => {
              cb();
            }
          });
        }}
      />

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
        <CardForm form={form}/>
      </Modal>
    </div>
  );
}

export default App;
