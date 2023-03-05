import React from 'react';
import { default as TrelloBoard } from 'react-trello';

interface IProps {
  data: ReactTrello.BoardData;
  onCardDelete?: (cardId: string, laneId: string) => void;
  onCardClick?: (cardId: string, metadata: any, laneId: string) => void;
  onBeforeCardDelete?: (callback: Function) => void;
}

export const Board: React.FC<IProps> = ({ data, onCardDelete, onBeforeCardDelete, onCardClick }) => {

  return (
    <div className="board">
      <TrelloBoard<any>
        data={data}
        onCardDelete={onCardDelete}
        onBeforeCardDelete={onBeforeCardDelete}
        onCardClick={onCardClick}
      />
    </div>
  );
}

export default Board;
