import React from 'react';
import { default as TrelloBoard } from 'react-trello';

interface IProps {
  data: ReactTrello.BoardData;
  onCardDelete?: (cardId: string, laneId: string) => void;
  onBeforeCardDelete?: (callback: Function) => void;
}

export const Board: React.FC<IProps> = ({ data, onCardDelete, onBeforeCardDelete }) => {

  return (
    <div className="board">
      <TrelloBoard
        data={data}
        onCardDelete={onCardDelete}
        onBeforeCardDelete={onBeforeCardDelete}
      />
    </div>
  );
}

export default Board;
