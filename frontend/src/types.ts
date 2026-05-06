export interface User {
  id: number;
  email: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  is_admin: boolean | number;
  is_verified: boolean | number;
  status: 'active' | 'blocked';
  interests?: string | string[];
  tags?: string | string[];
  newsletter_subscribed?: boolean;
  joined_at: string;
  saved_articles_count?: number;
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
  imageUrl?: string;
  image_url?: string;
  category: string;
  category_id?: number;
  author: string;
  date: string;
  isFeatured?: boolean | number;
  is_featured?: boolean | number;
  likes: number;
  dislikes: number;
  views?: number;
  created_at?: string;
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

export interface Donation {
  id: number;
  amount: number;
  full_name: string;
  email: string;
  message?: string;
  date: string;
}

export interface DonationSettings {
  goal_amount: number;
  current_amount: number;
  campaign_description: string;
  patreon_enabled: boolean;
  patreon_url?: string;
  paypal_enabled: boolean;
  paypal_email?: string;
  crypto_enabled: boolean;
  bitcoin_wallet?: string;
  ethereum_wallet?: string;
}

export interface AboutPage {
  title: string;
  subtitle: string;
  main_content: string;
  mission_statement: string;
  team_description: string;
  values_description: string;
  email: string;
  newsroom_email: string;
  address: string;
  phone: string;
}
