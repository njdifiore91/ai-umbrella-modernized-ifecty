# Contributing to ai_umbrella

This document provides guidelines for contributing to the ai_umbrella project, with specific emphasis on our modernized technology stack using Java 21 and Spring Boot 3.2.x.

## Table of Contents
- [Development Environment Setup](#development-environment-setup)
- [Code Standards and Guidelines](#code-standards-and-guidelines)
- [Testing Requirements](#testing-requirements)
- [Submission Process](#submission-process)

## Development Environment Setup

### Required Tools
1. **Java Development Kit**
   - Java 21 (LTS) with Virtual Thread support
   - Verify installation: `java -version` must show version 21 or higher
   - Configure IDE for Java 21 language features

2. **Spring Boot Environment**
   - Spring Boot 3.2.x (based on Spring Framework 6.1.x)
   - Jakarta EE package compatibility required
   - Embedded Apache Tomcat 10.1.18

3. **Build System**
   - Maven 3.6.3 or higher
   - Verify installation: `mvn -version`

4. **Container Runtime**
   - Docker with multi-stage build support
   - Verify installation: `docker version`

### IDE Configuration
Required plugins:
- Spring Boot Tools
- Java 21 Language Support
- Docker Integration

## Code Standards and Guidelines

### Java 21 Requirements

#### Virtual Thread Implementation
- Use `@Async` with Virtual Thread executor configuration
- Implement structured concurrency patterns
- Apply Virtual Thread best practices for I/O operations
- Configure thread pools for optimal Virtual Thread usage

#### Jakarta EE Migration
- Replace all `javax.*` imports with `jakarta.*` equivalents
- Update persistence annotations to Jakarta Persistence
- Migrate servlet components to Jakarta Servlet
- Use Jakarta Bean Validation annotations

#### Spring Boot 3.2.x Standards
- Leverage auto-configuration capabilities
- Implement Spring Boot Actuator endpoints
- Use container-friendly configurations
- Apply modern Spring Security patterns

#### Container Design Principles
- Follow container-first design approach
- Implement health check endpoints
- Configure container-aware logging
- Design for horizontal scalability

### Code Quality Requirements

#### SonarQube Quality Gates
- Code coverage must be ≥ 80%
- No critical vulnerabilities allowed
- Technical debt ratio must be < 5%
- Duplicate code must be < 3%

#### Security Requirements
- OWASP dependency check mandatory
- Container vulnerability scanning required
- Code security analysis must pass
- Third-party library security audit required

## Testing Requirements

### Unit Testing (JUnit Jupiter 5.10.1)
- Use `@Test` annotations for test methods
- Implement parameterized tests where appropriate
- Apply lifecycle annotations correctly
- Use `assertAll` for multiple assertions

### Integration Testing (Spring Boot Test 3.2.1)
- Use `@SpringBootTest` for integration tests
- Implement TestContainers for database tests
- Configure test profiles appropriately
- Use MockMvc for web layer testing

### Coverage Requirements
- Unit Tests:
  - Minimum 80% overall coverage
  - 90% coverage for critical paths
- Integration Tests:
  - Minimum 60% overall coverage
  - 75% coverage for critical paths

## Submission Process

### 1. Issue Creation
- Use appropriate issue template (bug/feature)
- Include modernization context
- Tag with relevant labels
- Link related issues

### 2. Development
- Follow branch naming convention: `feature/JIRA-XXX-description`
- Implement required tests
- Update documentation
- Verify container builds

### 3. Pull Request
- Complete PR template fully
- Ensure CI/CD pipeline passes
- Meet coverage requirements
- Include container verification

### 4. Review Process
Requirements for approval:
- Technical review by Java 21 expert
- Container design review
- Security assessment
- Performance evaluation

## Additional Resources

### Issue Templates
- [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)

### Pull Request Template
- [PR Template](.github/pull_request_template.md)

### Documentation
- [Technical Specification](docs/technical_specification.md)
- [API Documentation](docs/api/README.md)
- [Deployment Guide](docs/deployment/README.md)

## Questions and Support
For questions or support, please:
1. Check existing documentation
2. Search for existing issues
3. Create a new issue using appropriate template
4. Tag with relevant labels

## License
By contributing to ai_umbrella, you agree that your contributions will be licensed under its license terms.