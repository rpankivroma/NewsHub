
export const adminService = {
  getStats: async (filters: { days?: number; topLimit?: number; categoryFilter?: string } = {}) => {
    const token = localStorage.getItem('token');
    const { days = 30, topLimit = 5, categoryFilter = 'All' } = filters;
    const response = await fetch(`/api/admin/stats?days=${days}&top_limit=${topLimit}&category_filter=${categoryFilter}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return response.json();
  },

  getArticles: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/articles', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },

  getUsers: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getSubmissions: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/submissions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },

  getDonations: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/donations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch donations');
    return response.json();
  },

  deleteArticle: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete article');
    return response.json();
  },

  createArticle: async (article: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(article)
    });
    if (!response.ok) throw new Error('Failed to create article');
    return response.json();
  },

  updateArticle: async (id: number, article: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/articles/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(article)
    });
    if (!response.ok) throw new Error('Failed to update article');
    return response.json();
  },

  getCategories: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  updateSubmissionStatus: async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update submission');
    return response.json();
  },
  
  getDonationSettings: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/donation-settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch donation settings');
    return response.json();
  },
  
  updateDonationSettings: async (settings: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/donation-settings', {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update donation settings');
    return response.json();
  },
  
  getAboutPage: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/about-page', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch about page settings');
    return response.json();
  },
  
  updateAboutPage: async (pageData: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/about-page', {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pageData)
    });
    if (!response.ok) throw new Error('Failed to update about page settings');
    return response.json();
  },

  uploadImage: async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },

  toggleUserStatus: async (userId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/users/${userId}/toggle-block`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to toggle user status');
    return response.json();
  },

  createCategory: async (category: { name: string; description?: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(category)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create category');
    }
    return response.json();
  },

  deleteCategory: async (categoryId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete category');
    }
    return response.json();
  }
};
