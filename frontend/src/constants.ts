import { Article, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Business' },
  { id: 3, name: 'Science' },
  { id: 4, name: 'Health' },
  { id: 5, name: 'Sports' },
  { id: 6, name: 'Environment' },
  { id: 7, name: 'Politics' },
  { id: 8, name: 'Entertainment' },
  { id: 9, name: 'World' },
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Breaking: Revolutionary AI Technology Transforms Industries',
    excerpt: 'A groundbreaking development in artificial intelligence is reshaping how businesses operate worldwide.',
    content: 'Full story text here about AI...',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    category: 'Technology',
    author: 'Sarah Johnson',
    date: 'Apr 23, 2026',
    isFeatured: true,
    likes: 245,
    dislikes: 12
  },
  {
    id: 2,
    title: 'Climate Summit Reaches Historic Agreement',
    excerpt: 'World leaders unite on ambitious climate action plan with binding commitments.',
    content: 'Full story text here about Climate...',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    category: 'Environment',
    author: 'Michael Chen',
    date: 'Apr 22, 2026',
    isFeatured: true,
    likes: 189,
    dislikes: 8
  },
  {
    id: 3,
    title: 'Stock Markets Hit New Records Amid Economic Recovery',
    excerpt: 'Major indices surge as investors show confidence in global economic outlook.',
    content: '...',
    imageUrl: 'https://images.unsplash.com/photo-1611974714851-48206138d731?w=800',
    category: 'Business',
    author: 'Emily Rodriguez',
    date: 'Apr 22, 2026',
    isFeatured: false,
    likes: 156,
    dislikes: 23
  },
  {
    id: 4,
    title: 'Major Breakthrough in Cancer Research',
    excerpt: 'Scientists discover promising new treatment approach with remarkable results.',
    content: '...',
    imageUrl: 'https://images.unsplash.com/photo-1579152276502-7b646bc1947b?w=800',
    category: 'Health',
    author: 'Dr. James Williams',
    date: 'Apr 21, 2026',
    isFeatured: false,
    likes: 312,
    dislikes: 5
  }
];
