# AI Umbrella Backend Services

## Overview

Enterprise-grade insurance management backend services built with modern Java and Spring technologies:

- Spring Boot 3.2.x (based on Spring Framework 6.1.x)
- Java 21 (LTS) with Virtual Thread support
- Embedded Apache Tomcat 10.1.18 server
- Jakarta EE compliant implementation (migrated from javax.*)
- Container-first deployment model
- Production-ready configuration and monitoring

## Prerequisites

### Required Software
- Java Development Kit (JDK) 21 (LTS)
- Maven 3.6.3 or higher
- Docker Engine 24.0.0 or higher
- Kubernetes 1.28 or higher

### Access Requirements
- Harbor Container Registry credentials
- Development environment access
- IDE with Jakarta EE support

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/aicore/umbrella/
│   │       ├── config/          # Spring Boot configurations
│   │       ├── controller/      # REST endpoints
│   │       ├── domain/         # Jakarta Persistence entities
│   │       ├── service/        # Business logic with Virtual Threads
│   │       └── integration/    # External system clients
│   ├── resources/
│   │   ├── application.yml     # Core configuration
│   │   ├── application-*.yml   # Environment configs
│   │   └── db/migration/      # Flyway migrations
│   └── docker/
│       └── Dockerfile         # Multi-stage container build
└── kubernetes/
    └── manifests/            # K8s deployment configs
```

## Configuration

### Application Configuration (application.yml)
```yaml
spring:
  application:
    name: ai-umbrella-backend
  
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

# Virtual Thread Configuration
thread-pool:
  virtual:
    enabled: true
    core-size: 50
    max-size: 500
```

### Container Configuration (Dockerfile)
```dockerfile
# Build stage
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Build and Deployment

### Build Commands
```bash
# Build application
mvn clean package

# Build container image
docker build -t harbor.aicore.com/umbrella/backend:1.0.0 .

# Push to registry
docker push harbor.aicore.com/umbrella/backend:1.0.0
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: umbrella-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: umbrella-backend
        image: harbor.aicore.com/umbrella/backend:1.0.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
```

## Testing

### Unit Tests
```java
@SpringBootTest
class UmbrellaServiceTest {
    @Test
    @DisplayName("Should process policy with Virtual Threads")
    void testPolicyProcessing() {
        // Test implementation
    }
}
```

### Integration Tests
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class UmbrellaIntegrationTest {
    @Test
    @DisplayName("Should integrate with external systems")
    void testExternalIntegration() {
        // Test implementation
    }
}
```

## API Documentation

### REST Endpoints
- POST /api/v1/policies - Create new policy
- GET /api/v1/policies/{id} - Retrieve policy
- PUT /api/v1/policies/{id} - Update policy
- DELETE /api/v1/policies/{id} - Delete policy

### Authentication
- JWT-based authentication
- Token endpoint: POST /api/v1/auth/token
- Token refresh: POST /api/v1/auth/refresh

## Monitoring

### Health Checks
- /actuator/health - Overall health status
- /actuator/health/liveness - Container liveness
- /actuator/health/readiness - Application readiness

### Metrics
- /actuator/metrics - Core metrics
- /actuator/prometheus - Prometheus format metrics
- Virtual Thread metrics via JMX

## Security

### Spring Security Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Security configuration implementation
}
```

### Container Security
- Non-root user execution
- Read-only filesystem
- Resource isolation
- Network policies

## Troubleshooting

### Common Issues
1. Container startup failures
   - Check health endpoint logs
   - Verify resource allocations
   - Validate configuration

2. Performance issues
   - Monitor Virtual Thread usage
   - Check connection pool settings
   - Review resource utilization

### Debugging
- Enable debug logging: --debug flag
- Remote debugging port: 5005
- Container logs: kubectl logs -f pod-name

## Maintenance

### Version Updates
- Quarterly dependency reviews
- Security patch updates
- Container image updates
- Resource allocation reviews

### Performance Reviews
- Monthly Virtual Thread optimization
- Container resource monitoring
- Connection pool tuning
- Cache effectiveness analysis

## License

Copyright (c) 2023 AI Core Insurance. All rights reserved.