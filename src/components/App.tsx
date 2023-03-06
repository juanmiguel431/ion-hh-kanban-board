import React, { useEffect, useRef, useState } from 'react';
import Board from './Board';
import { Affix, Button, Divider, Form, Modal, Spin } from 'antd';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import CardForm from './CardForm';
import { CardStatus, ICard } from '../models';
import { Guid } from 'guid-typescript';
import { LocalStorageHelper } from '../utils';

const { confirm } = Modal;

const initialData: ReactTrello.BoardData = {
  lanes: [
    { id: 'Todo', title: 'To do', label: '', cards: [] },
    { id: 'InProgress', title: 'In progress', label: '', cards: [] },
    { id: 'Done', title: 'Done', label: '', cards: [] },
  ]
};

export const App: React.FC = () => {
  const localStorageRef = useRef<LocalStorageHelper | null>(null)
  const kanbanBoardKey = 'app_kanban_board';
  const [modalOpened, setModalOpened] = useState(false);
  const [form] = Form.useForm<ICard>();
  const [data, setData] = useState<ReactTrello.BoardData>(initialData);
  const [currentCard, setCurrentCard] = useState<ICard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialState, setIsInitialState] = useState(true);

  useEffect(() => {
    const storageHelper = new LocalStorageHelper();
    localStorageRef.current = storageHelper;

    const fetchBoardData = async () => {
      try {
        setIsLoading(true);
        await produceFakeDelay(5000);
        const boardData: ReactTrello.BoardData = storageHelper.getByKey(kanbanBoardKey);
        if (boardData) {
          setData(boardData);
        } else {
          storageHelper.setItem(kanbanBoardKey, initialData);
          setData(initialData);
        }
        setIsInitialState(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();

  }, []);

  const onFormSubmitted = () => {
    form.validateFields().then(async item => {
      try {
        if (!data) return;

        setIsLoading(true);

        const newData = getNewDataObject();

        if (currentCard) {
          const cardEdited = { ...currentCard, ...item };
          const lane = newData.lanes.find(p => p.id === cardEdited.status);
          const card = lane.cards?.find((p: ReactTrello.DraggableCard) => p.id === cardEdited.id);
          card.title = cardEdited.title;
          card.description = cardEdited.description;
          card.metadata = cardEdited;

          setCurrentCard(null);
        } else {
          const todo: CardStatus = 'Todo';
          const lane = newData.lanes.find(p => p.id === todo);
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

        await setNewBoardData(newData);
        setModalOpened(false);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const getNewDataObject = (): ReactTrello.BoardData => {
    const newData = { ...data };

    newData.lanes = newData.lanes.map(l => {
      return { ...l };
    });

    newData.lanes.forEach(l => {
      l.cards = l.cards?.map((c: ReactTrello.DraggableCard) => {
        return { ...c };
      });
    });

    return newData;
  }

  const setNewBoardData = async (newData: ReactTrello.BoardData) => {
    try {
      setIsLoading(true);

      if (!isInitialState) {
        await produceFakeDelay(2000);
        localStorageRef.current?.setItem(kanbanBoardKey, newData);
      }

      setData(newData);

    } finally {
      setIsLoading(false);
    }
  }

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

  const produceFakeDelay = async (ms: number) => {
    await new Promise(r => setTimeout(r, ms));
  }

  const onDeleteClick = (cb: Function) => {
    confirm({
      title: 'Do you want to delete this item?',
      icon: <ExclamationCircleFilled/>,
      onOk: async () => {
        cb();
      }
    });
  };

  const onCardDeleted = async (cardId: string, laneId: string) => {
    try {
      setIsLoading(true);

      const newData = getNewDataObject();
      const sourceLane = newData.lanes.find(p => p.id === laneId);
      const cardIndex = sourceLane.cards?.findIndex((c: ReactTrello.DraggableCard) => c.id === cardId);
      sourceLane.cards?.splice(cardIndex, 1);
      await setNewBoardData(newData);

    } finally {
      setIsLoading(false);
    }
  }

  const handleDragEnd = async (cardId: string, sourceLaneId: string, targetLaneId: string, position: number, cardDetails: ICard) => {
    const newData = getNewDataObject();

    const sourceLane = newData.lanes.find(p => p.id === sourceLaneId);
    const cardIndex = sourceLane.cards?.findIndex((c: ReactTrello.DraggableCard) => c.id === cardId);

    if (sourceLaneId === targetLaneId) {
      const fromIndex = cardIndex;
      const toIndex = position;
      const element = sourceLane.cards.splice(fromIndex, 1)[0];
      sourceLane.cards.splice(toIndex, 0, element);
    } else {
      const card = sourceLane.cards.find((c: ReactTrello.DraggableCard) => c.id === cardId);
      const targetLane = newData.lanes.find(p => p.id === targetLaneId);
      targetLane.cards?.splice(position, 0, { ...card, laneId: targetLaneId });
      sourceLane.cards?.splice(cardIndex, 1);
    }

    await setNewBoardData(newData);
  }

  return (
    <div className="app">
      <Affix offsetTop={10}>
        <Button
          disabled={isLoading}
          type="primary"
          icon={<PlusOutlined/>}
          onClick={onAddNew}
        >Add new</Button>
      </Affix>

      <Divider/>

      <Spin spinning={isLoading} size="large">
        <Board
          data={data}
          handleDragEnd={handleDragEnd}
          onBeforeCardDelete={onDeleteClick}
          onCardClick={onCardClick}
          onCardDelete={onCardDeleted}
        />
      </Spin>

      <Modal
        confirmLoading={isLoading}
        maskClosable={false}
        open={modalOpened}
        title={currentCard ? 'Edit' : 'New To do'}
        onCancel={_ => {
          setModalOpened(false);
        }}
        onOk={onFormSubmitted}
      >
        <CardForm
          form={form}
          disabled={isLoading}
        />
      </Modal>
    </div>
  );
}

export default App;
