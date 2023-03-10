import dayjs from 'dayjs'

export interface ICard {
  id: string;
  status: CardStatus;
  title: string;
  description: string;
  tags: CardTags[];
  dueDate?: string;
  dueDateObj?: dayjs.Dayjs;
}

export type CardTags = 'SEO' | 'Long Form' | 'Blog Post';

export type CardStatus = 'Todo' | 'InProgress' | 'Done';
