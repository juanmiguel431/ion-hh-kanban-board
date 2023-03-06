import React, { useEffect, useRef, useState } from 'react';
import Board from './Board';
import { Affix, Button, Col, Divider, Form, Input, Modal, Row, Spin } from 'antd';
import { ExclamationCircleFilled, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import CardForm from './CardForm';
import { CardStatus, ICard } from '../models';
import { Guid } from 'guid-typescript';
import { LocalStorageHelper } from '../utils';
import dayjs from 'dayjs';

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
  const [filteredData, setFilteredData] = useState<ReactTrello.BoardData>(data);
  const [currentCard, setCurrentCard] = useState<ICard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialState, setIsInitialState] = useState(true);
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState(term);

  useEffect(() => {
    const timerId = setInterval(() => {
      setDebouncedTerm(term);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [term]);

  useEffect(() => {
    const storageHelper = new LocalStorageHelper();
    localStorageRef.current = storageHelper;

    const fetchBoardData = async () => {
      try {
        setIsLoading(true);
        await produceFakeDelay(2500);
        const boardData: ReactTrello.BoardData = storageHelper.getByKey(kanbanBoardKey);
        if (boardData) {
          setData(boardData);

          const filteredData = getDeepCloneOfDataObject(boardData);
          filteredData.lanes.forEach(l => {
            l.cards = l.cards?.filter((c: ReactTrello.DraggableCard) => c.title.toLowerCase().indexOf(debouncedTerm.toLowerCase()) !== -1);
          });

          setFilteredData(filteredData);
        } else {
          storageHelper.setItem(kanbanBoardKey, initialData);
          setData(initialData);
          setFilteredData(initialData);
        }
        setIsInitialState(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();

  }, [debouncedTerm]);

  const onFormSubmitted = () => {
    form.validateFields().then(async item => {
      try {
        if (!data) return;

        setIsLoading(true);

        const newData = getDeepCloneOfDataObject(data);

        if (currentCard) {
          const cardEdited = { ...currentCard, ...item };
          cardEdited.dueDate = cardEdited.dueDateObj ? cardEdited.dueDateObj?.toISOString() : undefined;
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
          item.dueDate = item.dueDateObj ? item.dueDateObj?.toISOString() : undefined;
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

  const getDeepCloneOfDataObject = (data: ReactTrello.BoardData): ReactTrello.BoardData => {
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
      handleUpdateFilteredData(newData);

    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateFilteredData = (newData: ReactTrello.BoardData) => {
    const filteredData = getDeepCloneOfDataObject(newData);
    filteredData.lanes.forEach(l => {
      l.cards = l.cards?.filter((c: ReactTrello.DraggableCard) => c.title.toLowerCase().indexOf(debouncedTerm.toLowerCase()) !== -1);
    });

    setFilteredData(filteredData);
  }

  const onAddNew = () => {
    setCurrentCard(null);
    form.resetFields();
    setModalOpened(true);
  };

  const onCardClick = (cardId: string, metadata: ICard) => {
    setCurrentCard(metadata);
    form.resetFields();
    metadata.dueDateObj = metadata.dueDate ? dayjs(metadata.dueDate) : undefined;
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

      const newData = getDeepCloneOfDataObject(data);
      const sourceLane = newData.lanes.find(p => p.id === laneId);
      const cardIndex = sourceLane.cards?.findIndex((c: ReactTrello.DraggableCard) => c.id === cardId);
      sourceLane.cards?.splice(cardIndex, 1);
      await setNewBoardData(newData);

    } finally {
      setIsLoading(false);
    }
  }

  const handleDragEnd = async (cardId: string, sourceLaneId: string, targetLaneId: string, position: number, cardDetails: ICard) => {
    const newData = getDeepCloneOfDataObject(data);

    const sourceLane = newData.lanes.find(p => p.id === sourceLaneId);
    const cardIndex = sourceLane.cards?.findIndex((c: ReactTrello.DraggableCard) => c.id === cardId);

    let newPosition: number;
    if (debouncedTerm) {
      const cardInFilteredElements = filteredData.lanes.find(l => l.id === targetLaneId).cards.find((c: ReactTrello.DraggableCard, index: number) => index === position);
      newPosition = newData.lanes.find(l => l.id === targetLaneId).cards.findIndex((c: ReactTrello.DraggableCard) => c.id === cardInFilteredElements.id);
    } else {
      newPosition = position;
    }

    if (sourceLaneId === targetLaneId) {
      const fromIndex = cardIndex;
      const toIndex = newPosition;
      const element = sourceLane.cards.splice(fromIndex, 1)[0];
      sourceLane.cards.splice(toIndex, 0, element);
    } else {
      const card = sourceLane.cards.find((c: ReactTrello.DraggableCard) => c.id === cardId);
      const targetLane = newData.lanes.find(p => p.id === targetLaneId);
      targetLane.cards?.splice(newPosition, 0, { ...card, laneId: targetLaneId });
      sourceLane.cards?.splice(cardIndex, 1);
    }

    await setNewBoardData(newData);
  }

  return (
    <div className="app">
      <Affix offsetTop={10}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              allowClear
              disabled={isLoading}
              value={term}
              onChange={value => setTerm(value.target.value)}
              placeholder="Enter a search"
              prefix={<SearchOutlined/>}
            />
          </Col>
          <Col span={12}>
            <Button
              disabled={isLoading}
              type="primary"
              icon={<PlusOutlined/>}
              onClick={onAddNew}
            >Add new</Button>
          </Col>
        </Row>
      </Affix>

      <Divider/>

      <Spin spinning={isLoading} size="large">
        <Board
          data={filteredData}
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
        onCancel={_ => setModalOpened(false)}
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
