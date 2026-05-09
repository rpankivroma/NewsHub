
export const adminService = {
  getStats: async (filters: { days?: number; topLimit?: number; categoryFilter?: string; trafficTrendDays?: number } = {}) => {
    const token = localStorage.getItem('token');
    const { days = 30, topLimit = 5, categoryFilter = 'All', trafficTrendDays = 7 } = filters;
    const response = await fetch(`/api/admin/stats?days=${days}&top_limit=${topLimit}&category_filter=${categoryFilter}&traffic_trend_days=${trafficTrendDays}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return response.json();
  },

  getArticles: async (skip = 0, limit = 20, search?: string, category_id?: number) => {
    const token = localStorage.getItem('token');
    let url = `/api/admin/articles?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category_id) url += `&category_id=${category_id}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },

  getUsers: async (skip = 0, limit = 20, search?: string, is_admin?: boolean, status?: string) => {
    const token = localStorage.getItem('token');
    let url = `/api/admin/users?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (is_admin !== undefined) url += `&is_admin=${is_admin}`;
    if (status) url += `&status=${status}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getSubmissions: async (skip = 0, limit = 20, search?: string, status?: string) => {
    const token = localStorage.getItem('token');
    let url = `/api/admin/submissions?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;

    const response = await fetch(url, {
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
  },

  getLogs: async (skip = 0, limit = 10, search?: string, action?: string, admin_id?: number) => {
    const token = localStorage.getItem('token');
    let url = `/api/admin/logs?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (action) url += `&action=${encodeURIComponent(action)}`;
    if (admin_id) url += `&admin_id=${admin_id}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },

  trackPdfDownload: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/logs/track-pdf', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  },

  adminLogout: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  
  getManageAdmins: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/manage/admins', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch admins');
    return response.json();
  },

  promoteToAdmin: async (userId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/manage/admins/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to promote user');
    return response.json();
  },

  deleteAdminProfile: async (userId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/manage/admins/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete admin profile');
    return response.json();
  },

  downloadAdminsReport: async (selectedColumns: string[]) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/manage/admins/report', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ selected_columns: selectedColumns })
    });
    if (!response.ok) throw new Error('Failed to download report');
    return response.blob();
  }
};
