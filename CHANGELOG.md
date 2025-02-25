# Changelog
All notable changes to the ai_umbrella project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-15

### Added
- Support for Java 21 Virtual Threads for improved concurrency and performance (#245)
- Spring Boot 3.2.x auto-configuration capabilities (#246)
- Embedded Apache Tomcat 10.1.18 server for container-first deployment (#247)
- Container orchestration support through Kubernetes manifests (#248)
- Spring Boot Actuator endpoints for enhanced monitoring (#249)
- Health check endpoints for container orchestration platforms (#250)

### Changed
- Upgraded to Java 21 LTS from Java 11 (#251)
- Migrated from Spring Boot 2.x to Spring Boot 3.2.x (#252)
- Completed migration from javax.* to jakarta.* packages (#253)
- Modernized deployment model to use embedded Tomcat server (#254)
- Updated test infrastructure to use JUnit Jupiter and Spring Boot Test (#255)
- Enhanced logging framework with Spring Boot integration (#256)

### Deprecated
- Legacy JBoss EAP deployment model (#257)
- Custom health check implementations (#258)
- FileBasedAuthenticator in favor of Spring Security (#259)

### Removed
- Support for Java 11 (#260)
- javax.* package dependencies (#261)
- External Tomcat server deployment (#262)
- Custom monitoring endpoints (#263)

### Fixed
- Thread pool configuration for Virtual Thread support (#264)
- Connection pool settings for container deployment (#265)
- Test execution in containerized environments (#266)
- Health check response format (#267)

### Security
- Updated Spring Security configuration for Spring Boot 3.2.x (#268)
- Enhanced container security settings (#269)
- Improved secret management in container environment (#270)
- Updated security dependencies to latest versions (#271)

## [1.2.0] - 2023-12-01

### Added
- Preliminary container support (#235)
- Basic health check endpoints (#236)
- Initial Spring Boot integration (#237)

### Changed
- Updated build system for container support (#238)
- Enhanced logging configuration (#239)
- Improved test coverage (#240)

### Fixed
- Connection pool management issues (#241)
- Memory leak in long-running processes (#242)
- Test execution failures (#243)

### Security
- Updated security dependencies (#244)

## [1.1.0] - 2023-11-01

### Added
- Enhanced monitoring capabilities (#225)
- Improved error tracking (#226)
- Additional test coverage (#227)

### Changed
- Optimized database queries (#228)
- Updated logging format (#229)
- Enhanced error handling (#230)

### Fixed
- Memory management issues (#231)
- Connection pool leaks (#232)
- Test failures (#233)

### Security
- Security patch updates (#234)

## [1.0.0] - 2023-10-01

### Added
- Initial release of ai_umbrella project (#220)
- Core policy management functionality (#221)
- Basic monitoring capabilities (#222)
- Fundamental test infrastructure (#223)

### Security
- Initial security configuration (#224)