
export const newsService = {
  getArticles: async () => {
    const response = await fetch('/api/articles');
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
  }
};
