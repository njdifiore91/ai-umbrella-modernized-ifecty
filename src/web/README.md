# Umbrella Web Application

Modern, container-based frontend application for the Umbrella Insurance Management System built with React 18.2.0 and TypeScript 5.3.0.

## Overview

The Umbrella Web Application provides a comprehensive user interface for insurance policy management, underwriting, claims processing, and administrative functions. Built with modern web technologies and designed for container-based deployment.

### Key Features
- Policy lifecycle management interface
- Automated underwriting workflows
- Real-time rating capabilities
- Claims processing dashboard
- Document management system
- Administrative tools

### Technology Stack
- React 18.2.0
- TypeScript 5.3.0
- Material UI 5.0.0
- Styled Components 6.1.0
- React Query 3.39.3
- React Router 6.0.0
- Spring Boot Actuator Integration

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Docker >= 24.x
- Kubernetes CLI (kubectl)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd umbrella-web
```

2. Build container image:
```bash
docker build -t umbrella-web:latest .
```

3. Deploy to Kubernetes:
```bash
kubectl apply -f kubernetes/
```

4. Verify deployment:
```bash
kubectl get pods -l app=umbrella-web
```

## Development

### Container-based Development

1. Start development container:
```bash
docker run -it --rm \
  -v $(pwd):/app \
  -p 3000:3000 \
  umbrella-web:dev
```

2. Access development server:
```
http://localhost:3000
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run test suites
- `npm run test:coverage` - Run tests with coverage
- `npm run test:perf` - Run performance tests
- `npm run test:a11y` - Run accessibility tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript checks
- `npm run analyze` - Analyze bundle size
- `npm run security-audit` - Run security audit

## Project Structure

```
src/
├── assets/          # Static assets and images
├── components/      # Reusable UI components
├── pages/          # Page components
├── services/       # API services
├── hooks/          # Custom React hooks
├── context/        # React context providers
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── styles/         # Global styles and themes
└── kubernetes/     # Kubernetes deployment manifests
```

## Testing

The application uses Jest and React Testing Library for testing:

- Unit tests for components and utilities
- Integration tests for pages and workflows
- Performance testing with Jest Performance
- Accessibility testing with jest-axe
- Container-based test execution

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:perf

# Run accessibility tests
npm run test:a11y
```

## Deployment

### Container Deployment

1. Build production image:
```bash
docker build -t umbrella-web:prod -f Dockerfile.prod .
```

2. Deploy to environment:
```bash
# Development
kubectl apply -f kubernetes/dev/

# QA
kubectl apply -f kubernetes/qa/

# Production
kubectl apply -f kubernetes/prod/
```

### Environment Configuration

Environment-specific settings are managed through Kubernetes ConfigMaps:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: umbrella-web-config
data:
  REACT_APP_API_URL: "https://api.example.com"
  REACT_APP_ENVIRONMENT: "production"
```

## Monitoring and Health Checks

The application integrates with Spring Boot Actuator for monitoring:

- Health endpoint: `/actuator/health`
- Metrics endpoint: `/actuator/metrics`
- Info endpoint: `/actuator/info`

### Health Check Configuration

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

## Contributing

1. Follow TypeScript best practices
2. Ensure tests pass and maintain coverage
3. Use container-based development workflow
4. Follow commit message conventions
5. Update documentation as needed

## License

Proprietary - All rights reserved