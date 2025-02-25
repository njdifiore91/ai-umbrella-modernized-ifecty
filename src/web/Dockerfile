# Stage 1: Build environment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Set build arguments and environment variables
ARG NODE_ENV=production
ARG API_URL=http://umbrella-backend-service:8080
ARG BUILD_VERSION=1.0.0

ENV NODE_ENV=${NODE_ENV}
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=${API_URL}
ENV REACT_APP_VERSION=${BUILD_VERSION}

# Install build dependencies
RUN apk add --no-cache python3 make g++ \
    && yarn global add typescript@5.3.0

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with yarn
RUN yarn install --frozen-lockfile --production=false \
    && yarn cache clean

# Copy source code
COPY . .

# Build production bundle
RUN yarn build \
    && yarn cache clean

# Stage 2: Production environment
FROM nginx:1.25.3-alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Install required packages and security updates
RUN apk update && apk upgrade \
    && apk add --no-cache curl tzdata \
    && rm -rf /var/cache/apk/*

# Create nginx user and group
RUN addgroup -g 101 -S nginx \
    && adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist .

# Set correct permissions
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

# Configure security settings
RUN rm -rf /usr/share/nginx/html/index.html.default \
    && rm -rf /docker-entrypoint.d \
    && rm -rf /usr/share/nginx/html/50x.html

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Configure health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/actuator/health || exit 1

# Set container labels
LABEL maintainer="PRC Insurance" \
      application="umbrella-web" \
      version="1.0.0" \
      environment="production" \
      monitoring.health.path="/actuator/health"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]