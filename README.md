# AI Umbrella Insurance Management System

Enterprise-grade insurance domain application combining sophisticated backend services with a modern user interface, built on Java 21 and Spring Boot 3.2.x.

## Overview

The ai_umbrella system is a comprehensive insurance management platform providing:

- Policy lifecycle management
- Automated underwriting workflows
- Real-time rating capabilities
- Claims processing
- Third-party system integration
- Document management

### Key Technical Features

- Modern Java 21 (LTS) platform with Virtual Thread support
- Spring Boot 3.2.x (based on Spring Framework 6.1.x)
- Jakarta EE compliant implementation (migrated from javax.*)
- Embedded Apache Tomcat 10.1.18 server
- Container-first deployment model
- Production-ready monitoring via Spring Boot Actuator

## Prerequisites

### Development Tools
- Java Development Kit (JDK) 21 (LTS)
- Maven 3.6.3 or higher
- Node.js >= 18.x
- Docker Engine 24.0.0 or higher
- Kubernetes 1.28 or higher

### Infrastructure
- Microsoft SQL Server
- IBM DB2
- Harbor Container Registry access
- Kubernetes cluster

## Project Structure

```
.
├── src/
│   ├── backend/                 # Spring Boot backend services
│   │   ├── main/
│   │   │   ├── java/           # Java source files
│   │   │   └── resources/      # Application configuration
│   │   └── test/               # Test files
│   └── web/                    # React frontend application
│       ├── src/                # TypeScript source files
│       └── public/             # Static assets
├── kubernetes/                 # Kubernetes deployment manifests
│   ├── dev/                    # Development environment
│   ├── qa/                     # QA environment
│   └── prod/                   # Production environment
└── docs/                       # Project documentation
```

## Quick Start

### Backend Services

1. Build backend:
```bash
cd src/backend
mvn clean package
```

2. Build container:
```bash
docker build -t harbor.aicore.com/umbrella/backend:1.0.0 .
```

3. Deploy to Kubernetes:
```bash
kubectl apply -f kubernetes/dev/
```

### Frontend Application

1. Install dependencies:
```bash
cd src/web
npm install
```

2. Build container:
```bash
docker build -t harbor.aicore.com/umbrella/web:1.0.0 .
```

3. Deploy to Kubernetes:
```bash
kubectl apply -f kubernetes/dev/
```

## Configuration

### Application Properties

```yaml
spring:
  application:
    name: ai-umbrella
  
  # Jakarta Persistence Configuration
  jpa:
    open-in-view: false
    properties:
      jakarta:
        persistence:
          sharedCache:
            mode: ENABLE_SELECTIVE

  # Embedded Tomcat Configuration  
  tomcat:
    threads:
      max: 200
      min-spare: 10
    virtual:
      enabled: true

  # Actuator Configuration
  management:
    endpoints:
      web:
        exposure:
          include: health,metrics,prometheus
    health:
      probes:
        enabled: true
```

## Monitoring

The system leverages Spring Boot Actuator for comprehensive monitoring:

- Health checks: `/actuator/health`
- Metrics: `/actuator/metrics`
- Prometheus: `/actuator/prometheus`
- Environment: `/actuator/env`

## Development

### Java Development

- Use Virtual Threads for I/O operations
- Follow Jakarta EE package standards
- Leverage Spring Boot auto-configuration
- Implement container-aware design patterns

### Frontend Development

- TypeScript with React 18.2.0
- Material UI components
- Container-based development workflow
- Integration with Spring Boot Actuator

## Testing

### Backend Testing

- JUnit Jupiter for unit tests
- Spring Boot Test for integration tests
- TestContainers for database tests
- Virtual Thread performance testing

### Frontend Testing

- Jest with React Testing Library
- Performance testing with Jest Performance
- Accessibility testing with jest-axe
- Container-based test execution

## Deployment

The system uses a container-first deployment model:

1. Build container images:
```bash
# Backend
docker build -t harbor.aicore.com/umbrella/backend:1.0.0 src/backend/

# Frontend
docker build -t harbor.aicore.com/umbrella/web:1.0.0 src/web/
```

2. Push to registry:
```bash
docker push harbor.aicore.com/umbrella/backend:1.0.0
docker push harbor.aicore.com/umbrella/web:1.0.0
```

3. Deploy to Kubernetes:
```bash
kubectl apply -f kubernetes/
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## License

Copyright (c) 2023 AI Core Insurance. All rights reserved.