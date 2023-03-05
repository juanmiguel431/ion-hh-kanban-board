import React from 'react';
import { default as TrelloBoard } from 'react-trello';

interface IProps {
  data: ReactTrello.BoardData;
  onCardDelete?: (cardId: string, laneId: string) => void;
  onCardClick?: (cardId: string, metadata: any, laneId: string) => void;
  onBeforeCardDelete?: (callback: Function) => void;
  onDataChange?: (newData: any) => void;
}

export const Board: React.FC<IProps> = (props) => {

  return (
    <div className="board">
      <TrelloBoard
        style={{ background: '#8ba4d6' }}
        data={props.data}
        onCardDelete={props.onCardDelete}
        onBeforeCardDelete={props.onBeforeCardDelete}
        onCardClick={props.onCardClick}
        onDataChange={props.onDataChange}
      />
    </div>
  );
}

export default Board;
