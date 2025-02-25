/**
 * Root application component providing global context providers, routing configuration,
 * and main application layout structure. Implements secure authentication with Spring Security
 * integration and container-aware session management.
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useMonitoring } from '@spring-boot/actuator-react';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

// Configure QueryClient with monitoring integration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Query error:', error);
      }
    }
  }
});

/**
 * Protected route component that handles authentication checks and session validation
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { validateSession, isAuthenticated, user } = useAuthContext();
  const { metrics } = useMonitoring();

  useEffect(() => {
    const validateAuth = async () => {
      const isValid = await validateSession();
      if (!isValid) {
        metrics?.increment('auth.session.invalid');
      } else {
        metrics?.increment('auth.session.valid');
      }
    };

    validateAuth();
  }, [validateSession, metrics]);

  if (!isAuthenticated) {
    metrics?.increment('auth.access.denied');
    return <Navigate to="/login" replace />;
  }

  metrics?.increment('auth.access.granted', { 
    userId: user?.id.toString() 
  });

  return <>{children}</>;
};

/**
 * Root application component with enhanced security and monitoring capabilities
 */
const App: React.FC = () => {
  const { health, metrics } = useMonitoring({
    endpoints: {
      health: '/actuator/health',
      metrics: '/actuator/metrics',
      info: '/actuator/info'
    }
  });

  // Monitor application health status
  useEffect(() => {
    if (health?.status) {
      metrics?.gauge('app.health.status', health.status === 'UP' ? 1 : 0);
    }
  }, [health, metrics]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={<Login />} 
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                {/* Default Redirect */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* 404 Redirect */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;