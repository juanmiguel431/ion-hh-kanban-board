import React from 'react';
import { default as TrelloBoard } from 'react-trello';

export const Board: React.FC = () => {

  const data = {
    lanes: [
      {
        id: 'lane1',
        title: 'To do',
        label: '2/2',
        cards: [
          {id: 'Card1', title: 'Write Blog', description: 'Can AI make memes', label: '30 mins', draggable: false},
          {id: 'Card2', title: 'Pay Rent', description: 'Transfer via NEFT', label: '5 mins', metadata: {sha: 'be312a1'}}
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
          {id: 'Card1', title: 'Write Blog', description: 'Can AI make memes', label: '30 mins', draggable: false},
          {id: 'Card2', title: 'Pay Rent', description: 'Transfer via NEFT', label: '5 mins', metadata: {sha: 'be312a1'}}
        ]
      },
    ]
  }

  return (
    <div className="board">
      <TrelloBoard data={data} />
    </div>
  );
}

export default Board;
