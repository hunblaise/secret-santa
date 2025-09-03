# CORS Configuration Guide

## Overview
The Secret Santa application now includes flexible CORS configuration that supports multiple deployment environments. 

**Important**: This configuration is designed for Spring WebFlux (reactive) applications and uses `CorsWebFilter` instead of servlet-based filters.

## Configuration Files

### Main Configuration
- `application.properties` - Default CORS settings
- `application-local.properties` - Development environment
- `application-production.properties` - Production environment

## Environment-Specific Usage

### Local Development
```bash
# Uses application-local.properties
./mvnw spring-boot:run -Dspring.profiles.active=local
```
**Allowed Origins:** `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`

### Production Deployment
```bash
# Uses application-production.properties
java -jar target/secret-santa.jar --spring.profiles.active=production
```
**Allowed Origins:** Set via `ALLOWED_ORIGINS` environment variable

### Custom Origins via Environment Variables
```bash
# Override allowed origins
export ALLOWED_ORIGINS="https://secretsanta.mydomain.com,https://staging.mydomain.com"
java -jar target/secret-santa.jar --spring.profiles.active=production
```

## Docker Deployment Example
```dockerfile
ENV ALLOWED_ORIGINS=https://secretsanta.mydomain.com
ENV SPRING_PROFILES_ACTIVE=production
```

## Frontend Environment Variables
Update your frontend `.env.local` or `.env.production`:
```bash
# Local development
NEXT_PUBLIC_API_URL=http://localhost:8080

# Production
NEXT_PUBLIC_API_URL=https://api.secretsanta.mydomain.com
```

## Security Best Practices
- **Production**: Restrict origins to your actual domain only
- **Staging**: Use staging-specific domains
- **Local**: Allow localhost variations for development flexibility
- **Credentials**: Disabled in production, enabled only for development

## Troubleshooting
1. Restart Spring Boot after configuration changes
2. Check browser Network tab for CORS preflight requests
3. Verify `OPTIONS` requests return `200 OK`
4. Ensure frontend origin matches exactly (including protocol and port)