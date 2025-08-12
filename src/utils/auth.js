// Auth utility functions
const API_BASE = 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = this.getStoredUser();
  }

  getStoredUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  setUser(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  // Refresh token if expired
  async refreshTokenIfNeeded() {
    if (!this.isAuthenticated()) return false;
    
    if (this.isTokenExpired()) {
      try {
        const response = await fetch(`${API_BASE}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.setToken(data.token);
          this.setUser(data.user);
          return true;
        } else {
          // Refresh failed, clear auth
          this.clearAuth();
          return false;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearAuth();
        return false;
      }
    }
    
    return true;
  }

  // Make authenticated API call with automatic token refresh
  async apiCall(url, options = {}) {
    // Try to refresh token if needed
    const tokenValid = await this.refreshTokenIfNeeded();
    if (!tokenValid) {
      throw new Error('Authentication required');
    }

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    const response = await fetch(url, config);

    // If we get 401, try to refresh once more
    if (response.status === 401) {
      const refreshed = await this.refreshTokenIfNeeded();
      if (refreshed) {
        // Retry with new token
        config.headers = {
          ...config.headers,
          ...this.getAuthHeaders()
        };
        return fetch(url, config);
      } else {
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Authentication expired');
      }
    }

    return response;
  }

  // Login method
  async login(email, password, role) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        this.setToken(data.token);
        this.setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }

  // Logout method
  logout() {
    this.clearAuth();
    window.location.href = '/login';
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
