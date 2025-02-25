import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { MonitoringProvider } from '@spring-boot/actuator-react';
import App from './App';
import GlobalStyle from './styles/global';

// Configuration for Spring Boot Actuator monitoring
const MONITORING_CONFIG = {
  endpoints: {
    metrics: '/actuator/metrics',
    health: '/actuator/health',
    info: '/actuator/info'
  },
  refreshInterval: 30000, // 30 seconds
  enableMetrics: true,
  enableTracing: true
};

// Performance monitoring thresholds
const PERFORMANCE_THRESHOLDS = {
  renderTimeout: 3000, // 3 seconds
  interactionDelay: 100, // 100ms
  resourceTimeout: 5000 // 5 seconds
};

/**
 * Error fallback component with accessibility support
 */
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div role="alert" aria-live="assertive">
    <h2>Application Error</h2>
    <pre style={{ color: 'red' }}>{error.message}</pre>
    <button onClick={() => window.location.reload()}>
      Reload Application
    </button>
  </div>
);

/**
 * Initialize and render the React application with monitoring and error handling
 */
const renderApp = () => {
  // Get root element with ARIA landmark role
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  rootElement.setAttribute('role', 'application');
  rootElement.setAttribute('aria-label', 'Insurance Application');

  // Create root using React 18 createRoot API
  const root = createRoot(rootElement);

  // Enable React strict mode for development best practices
  root.render(
    <React.StrictMode>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => {
          console.error('Application error:', error);
          // Log error to monitoring system
          if (window.monitoring) {
            window.monitoring.logError(error);
          }
        }}
      >
        <MonitoringProvider
          config={MONITORING_CONFIG}
          thresholds={PERFORMANCE_THRESHOLDS}
        >
          <GlobalStyle />
          <App />
        </MonitoringProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Report initial render timing
  if (window.performance) {
    const timing = window.performance.now();
    console.debug(`Initial render completed in ${Math.round(timing)}ms`);
  }
};

// Initialize application with error handling
try {
  renderApp();
} catch (error) {
  console.error('Failed to initialize application:', error);
  // Render minimal error state if initialization fails
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div role="alert" style="color: red; padding: 20px;">
        <h1>Critical Error</h1>
        <p>The application failed to initialize. Please try refreshing the page.</p>
      </div>
    `;
  }
}

// Add type definition for monitoring
declare global {
  interface Window {
    monitoring?: {
      logError: (error: Error) => void;
    };
  }
}