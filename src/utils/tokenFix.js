// Fix expired token script - add this to your main App.jsx
export const clearExpiredToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp < now) {
        console.log('🧹 Clearing expired token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.log('🧹 Clearing invalid token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// Call this on app startup
