export interface User {
  id: number;
  email: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  is_admin: boolean;
  status: 'active' | 'blocked';
  interests?: string[];
  joined_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  author: string;
  date: string;
  isFeatured: boolean;
  likes: number;
  dislikes: number;
}

export interface Comment {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  date: string;
}
