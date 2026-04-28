import { User, Token } from '../types';

const API_BAR_URL = '/api'; // Assuming proxy or same domain

export const authService = {
  async login(email: string, password: string): Promise<Token> {
    console.log('authService.login called with:', { email, password });
    if (!email || !password) {
      console.error('authService.login: Missing credentials!');
    }
    const payload = { email, username: email, password };
    console.log('authService.login sending payload:', payload);
    
    const response = await fetch(`${API_BAR_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorDetail = 'Login failed';
        const text = await response.text();
        console.error('authService.login error response:', text);
        try {
            if (text) {
                const error = JSON.parse(text);
                errorDetail = error.detail || errorDetail;
            }
        } catch (e) {
            console.error('Failed to parse error JSON', e, 'Response text:', text);
        }
        throw new Error(errorDetail);
    }

    const text = await response.text();
    try {
        const data = JSON.parse(text);
        localStorage.setItem('token', data.access_token);
        return data;
    } catch (e) {
        console.error('Failed to parse success JSON', e, 'Response text:', text);
        throw new Error('Invalid response from server');
    }
  },

  async register(email: string, password: string, fullName: string): Promise<User> {
    console.log('authService.register calling with:', { email, password, fullName });
    const response = await fetch(`${API_BAR_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (!response.ok) {
        let errorDetail = 'Registration failed';
        const text = await response.text();
        try {
            if (text) {
                const error = JSON.parse(text);
                errorDetail = error.detail || errorDetail;
            }
        } catch (e) {
            console.error('Failed to parse error JSON', e, 'Response text:', text);
        }
        throw new Error(errorDetail);
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse success JSON', e, 'Response text:', text);
        throw new Error('Invalid response from server');
    }
  },

  async getMe(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BAR_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        localStorage.removeItem('token');
        throw new Error('Failed to fetch user');
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse success JSON', e, 'Response text:', text);
        throw new Error('Invalid response from server');
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  }
};
