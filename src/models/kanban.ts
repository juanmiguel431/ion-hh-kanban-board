import * as dayjs from 'dayjs'

export interface ICard {
  title: string;
  description: string;
  tags: CardTags[];
  dueDate: dayjs.Dayjs;
}

export type CardTags = 'SEO' | 'Long Form' | 'Blog Post';
