## PR Title
[JIRA-XXX] Brief description of changes

## Description
- Detailed explanation of changes
- Motivation and context
- Dependencies affected
- Impact on existing functionality

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Configuration change
- [ ] CI/CD improvement
- [ ] Performance optimization
- [ ] Security enhancement

## Testing
- [ ] Unit tests using JUnit Jupiter
- [ ] Integration tests with Spring Boot Test
- [ ] Performance tests for Virtual Thread usage
- [ ] Container deployment tests
- [ ] Test coverage maintained/improved
- [ ] Local environment testing completed
- [ ] Regression tests passed

## Technical Details
- [ ] Java 21 features utilized appropriately
  - [ ] Virtual Thread implementation where applicable
  - [ ] Pattern matching optimizations
  - [ ] Modern language features
- [ ] Spring Boot 3.2.x best practices followed
  - [ ] Auto-configuration utilized effectively
  - [ ] Actuator endpoints configured
  - [ ] Native compilation compatibility maintained
- [ ] Jakarta EE package migration standards met
  - [ ] All javax.* imports replaced with jakarta.*
  - [ ] XML configurations updated
  - [ ] Annotation changes verified
- [ ] Container-friendly implementation
  - [ ] Resource configurations optimized
  - [ ] Health check endpoints implemented
  - [ ] Graceful shutdown support

## Quality Checks
- [ ] Code follows project style guidelines
- [ ] Documentation updated
  - [ ] API documentation
  - [ ] Configuration changes
  - [ ] Deployment instructions
- [ ] SonarQube analysis passed
  - [ ] Code coverage requirements met
  - [ ] No critical/blocker issues
  - [ ] Technical debt addressed
- [ ] Security considerations
  - [ ] No vulnerabilities introduced
  - [ ] Secure coding practices followed
  - [ ] Dependency security verified
- [ ] Performance impact
  - [ ] Resource utilization verified
  - [ ] Response times maintained
  - [ ] Scalability considered

## Deployment Considerations
- [ ] Database migration scripts
  - [ ] Forward migration tested
  - [ ] Rollback procedures verified
- [ ] Configuration changes
  - [ ] Environment variables updated
  - [ ] ConfigMaps/Secrets modified
  - [ ] Feature flags configured
- [ ] Container updates
  - [ ] Docker image changes required
  - [ ] Resource limits configured
  - [ ] Health check implementation
- [ ] Infrastructure changes
  - [ ] Kubernetes manifests updated
  - [ ] Service dependencies verified
  - [ ] Scaling requirements addressed

## Checklist
- [ ] JIRA ticket updated with implementation details
- [ ] Code self-reviewed for Java 21 and Spring Boot 3.2.x compliance
- [ ] All tests passing in CI environment
- [ ] Documentation updated including API changes
- [ ] PR description complete with technical details
- [ ] Dependent PRs linked and coordinated
- [ ] Container deployment verified locally
- [ ] Performance impact assessed and documented
- [ ] Security review completed