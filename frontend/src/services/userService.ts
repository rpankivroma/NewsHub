import { User, Article } from '../types';

const API_URL = '/api/users';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  updateMe: async (userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_URL}/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  uploadPhoto: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/me/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload photo');
    return response.json();
  },

  getPersonalizedFeed: async (skip = 0, limit = 10, search?: string): Promise<Article[]> => {
    let url = `${API_URL}/me/personalized?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch personalized feed');
    return response.json();
  },

  getSavedArticles: async (skip = 0, limit = 20, search?: string, category_id?: number): Promise<Article[]> => {
    let url = `${API_URL}/me/saved?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category_id) url += `&category_id=${category_id}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch saved articles');
    return response.json();
  },

  toggleSaveArticle: async (articleId: number): Promise<{ saved: boolean }> => {
    const response = await fetch(`/api/articles/${articleId}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to toggle save article');
    return response.json();
  },

  isArticleSaved: async (articleId: number): Promise<{ saved: boolean }> => {
    const response = await fetch(`/api/articles/${articleId}/is-saved`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to check if article is saved');
    return response.json();
  },

  getSubmissions: async (skip = 0, limit = 20, search?: string, status?: string): Promise<any[]> => {
    let url = `${API_URL}/me/submissions?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },

  updateSubmission: async (id: number, data: any): Promise<any> => {
    const response = await fetch(`/api/submissions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update submission');
    return response.json();
  },

  uploadSubmissionPhoto: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/submissions/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload photo');
    return response.json();
  }
};
