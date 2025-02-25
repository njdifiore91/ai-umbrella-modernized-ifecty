# Build stage
FROM maven:3.9.5-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /build

# Copy pom.xml for dependency resolution
COPY pom.xml .

# Download dependencies in separate layer for better caching
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application with Maven
RUN mvn clean package -DskipTests \
    --no-transfer-progress \
    -Dmaven.test.skip=true \
    -Dspring.profiles.active=prod

# Runtime stage
FROM eclipse-temurin:21-jre-jammy

# Create non-root user/group
RUN groupadd -g 1000 umbrella && \
    useradd -u 1000 -g umbrella -s /bin/bash -m umbrella

# Set working directory
WORKDIR /app

# Copy compiled application from build stage
COPY --from=build /build/target/umbrella-backend-*.jar app.jar

# Create necessary directories with correct permissions
RUN mkdir -p /app/logs /app/config && \
    chown -R umbrella:umbrella /app && \
    chmod -R 755 /app

# Switch to non-root user
USER umbrella:umbrella

# Configure JVM options for containers
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -Duser.timezone=UTC \
    -Dfile.encoding=UTF-8 \
    --enable-preview \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/app/logs/heapdump.hprof"

# Set Spring profile
ENV SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-prod}

# Expose application port
EXPOSE 8080

# Configure health check using Spring Boot Actuator
HEALTHCHECK --interval=30s \
            --timeout=3s \
            --retries=3 \
            --start-period=60s \
            CMD curl -f http://localhost:8080/actuator/health/liveness || exit 1

# Start Spring Boot application
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -jar app.jar" ]