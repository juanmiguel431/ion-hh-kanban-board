import React, { useState } from 'react';
import Board from './Board';
import { Affix, Button, Divider, Form, Modal } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import CardForm from './CardForm';
import { CardStatus, ICard } from '../models';
import { Guid } from 'guid-typescript';

const { confirm } = Modal;

const initialData: ReactTrello.BoardData = {
  lanes: [
    {
      id: 'Todo',
      title: 'To do',
      label: '2/4',
      cards: [
        {
          id: 'b77d409a-10cd-4a47-8e94-b0cd0ab50aa1',
          title: 'Write Blog',
          description: 'Can AI make memes',
          label: '30 mins',
          laneId: 'Todo',
          metadata: {
            id: 'b77d409a-10cd-4a47-8e94-b0cd0ab50aa1',
            title: 'Write Blog',
            description: 'Can AI make memes',
            status: 'Todo'
          },
        },
        {
          id: 'b77d409a-10cd-4a47-8e94-b0cd0ab50aa2',
          title: 'Pay Rent',
          description: 'Transfer via NEFT',
          label: '5 mins',
          laneId: 'Todo',
          metadata: {
            id: 'b77d409a-10cd-4a47-8e94-b0cd0ab50aa2',
            title: 'Pay Rent',
            description: 'Transfer via NEFT',
            status: 'Todo'
          },
        }
      ]
    },
    {
      id: 'InProgress',
      title: 'In progress',
      label: '0/4',
      cards: []
    },
    {
      id: 'Done',
      title: 'Done',
      label: '2/4',
      cards: [
        {
          id: 'b77d409a-10cd-4a47-8e94-b0cd0ab50aa3',
          title: 'Write Blog',
          description: 'Can AI make memes',
          label: '30 mins',
          laneId: 'Done',
          metadata: {
            id: 'b77d409a-10cd-4a47-8e94-b0cd0ab50aa3',
            title: 'Write Blog',
            description: 'Can AI make memes',
            status: 'Done'
          },
        },
        {
          id: 'b77d409a-10cd-4a47-8e94-b0cd0ab50aa4',
          title: 'Pay Rent',
          description: 'Transfer via NEFT',
          label: '5 mins',
          laneId: 'Done',
          metadata: {
            id: 'b77d409a-10cd-4a47-8e94-b0cd0ab50aa4',
            title: 'Pay Rent',
            description: 'Transfer via NEFT',
            status: 'Done'
          },
        }
      ]
    },
  ]
}

export const App: React.FC = () => {
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [form] = Form.useForm<ICard>();
  const [data, setData] = useState<ReactTrello.BoardData>(initialData);
  const [currentCard, setCurrentCard] = useState<ICard | null>(null);

  const onFormSubmitted = () => {
    form.validateFields().then(item => {
      if (currentCard) {
        const cardEdited = { ...currentCard, ...item };
        const lane = data.lanes.find(p => p.id === cardEdited.status);
        const card = lane.cards?.find((p: ReactTrello.DraggableCard) => p.id === cardEdited.id);
        card.title = cardEdited.title;
        card.description = cardEdited.description;
        card.metadata = cardEdited;

        setCurrentCard(null);
      } else {
        const todo: CardStatus = 'Todo';
        const lane = data.lanes.find(p => p.id === todo);
        item.id = Guid.raw();
        item.status = todo;
        const card: ReactTrello.DraggableCard = {
          id: item.id,
          laneId: item.status,
          title: item.title,
          description: item.description,
          metadata: item,
        };

        lane.cards?.push(card);
      }

      setData({ ...data });
      setModalOpened(false);
    });
  };

  const onAddNew = () => {
    setCurrentCard(null);
    form.resetFields();
    setModalOpened(true);
  };

  const onCardClick = (cardId: string, metadata: ICard) => {
    setCurrentCard(metadata);
    form.resetFields();
    form.setFieldsValue(metadata);
    setModalOpened(true);
  }

  const onDeleteClick = (cb: Function) => {
    confirm({
      title: 'Do you want to delete this item?',
      icon: <ExclamationCircleFilled/>,
      onOk: async () => {
        await new Promise(r => setTimeout(r, 1500));
        cb();
      }
    });
  };

  return (
    <div className="app">
      <Affix offsetTop={10}>
        <Button
          type="primary"
          icon={<PlusOutlined/>}
          onClick={onAddNew}
        >Add new</Button>
      </Affix>

      <Divider/>

      <Board
        data={data}
        onDataChange={setData}
        onBeforeCardDelete={onDeleteClick}
        onCardClick={onCardClick}
      />

      <Modal
        maskClosable={false}
        open={modalOpened}
        title={currentCard ? 'Edit' : 'New To do'}
        onCancel={_ => {
          setModalOpened(false);
        }}
        onOk={onFormSubmitted}
      >
        <CardForm form={form}/>
      </Modal>
    </div>
  );
}

export default App;
