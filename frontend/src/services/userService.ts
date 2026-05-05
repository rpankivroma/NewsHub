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

  getPersonalizedFeed: async (): Promise<Article[]> => {
    const response = await fetch(`${API_URL}/me/personalized`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch personalized feed');
    return response.json();
  },

  getSubmissions: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/me/submissions`, {
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
