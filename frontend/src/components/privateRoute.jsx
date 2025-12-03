import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const PrivateRoute = ({ children, role }) => {
  const [authStatus, setAuthStatus] = useState({
    loading: true,
    isAuthenticated: false,
    user: null
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('🔒 PrivateRoute: Checking authentication...');
      
      const response = await fetch('http://localhost:3000/auth/check', {
        credentials: 'include' 
      });
      
      const data = await response.json();
      console.log('🔒 PrivateRoute API response:', data);
      
      if (data.authenticated && data.user) {
        setAuthStatus({
          loading: false,
          isAuthenticated: true,
          user: data.user
        });
        
        localStorage.setItem('user', JSON.stringify({
          name: data.user.username,
          initials: data.user.username.split(' ').map(n => n[0]).join('').toUpperCase(),
          isLoggedIn: true,
          role: data.user.role || 'guest'
        }));
      } else {
        setAuthStatus({
          loading: false,
          isAuthenticated: false,
          user: null
        });
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('❌ PrivateRoute auth check error:', error);
      setAuthStatus({
        loading: false,
        isAuthenticated: false,
        user: null
      });
    }
  };

  if (authStatus.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c19a6b]"></div>
      </div>
    );
  }

  if (!authStatus.isAuthenticated) {
    console.log('📍 PrivateRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (role && authStatus.user.role !== role) {
    console.log('📍 PrivateRoute: Role mismatch, redirecting home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ PrivateRoute: User authenticated, rendering protected content');
  return children;
};

export default PrivateRoute;