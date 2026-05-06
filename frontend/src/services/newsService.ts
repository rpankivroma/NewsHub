
export const newsService = {
  getArticles: async (skip = 0, limit = 20, search?: string, category_id?: number) => {
    let url = `/api/articles?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category_id) url += `&category_id=${category_id}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },

  getArticle: async (id: number) => {
    const response = await fetch(`/api/articles/${id}`);
    if (!response.ok) throw new Error('Failed to fetch article');
    return response.json();
  },

  getCategories: async () => {
    const response = await fetch('/api/categories');
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  getAbout: async () => {
    const response = await fetch('/api/about');
    if (!response.ok) throw new Error('Failed to fetch about information');
    return response.json();
  },

  getDonationSettings: async () => {
    const response = await fetch('/api/donations/settings');
    if (!response.ok) throw new Error('Failed to fetch donation settings');
    return response.json();
  },

  likeArticle: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/articles/${id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to like article');
    return response.json();
  },

  dislikeArticle: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/articles/${id}/dislike`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to dislike article');
    return response.json();
  },

  saveArticle: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/articles/${id}/save`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to save article');
    return response.json();
  },

  getInteractions: async (id: number) => {
    const token = localStorage.getItem('token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`/api/articles/${id}/interactions`, { headers });
    if (!response.ok) return { liked: false, disliked: false, saved: false };
    return response.json();
  },

  getComments: async (id: number) => {
    const response = await fetch(`/api/articles/${id}/comments`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  addComment: async (content: string, articleId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ content, article_id: articleId })
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  deleteComment: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return response.json();
  }
};
