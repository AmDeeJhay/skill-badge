# 🚀 Skill Badge Production Deployment Guide

This guide provides comprehensive instructions for deploying Skill Badge to production environments.

## 📋 Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose installed
- PostgreSQL database
- Redis instance
- Domain name (for SSL configuration)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Nginx Proxy   │◄──►│   Backend API   │
│   (Next.js)     │    │   (SSL/TLS)     │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  PostgreSQL     │    │   Redis Cache   │    │   File Storage  │
│  Database       │    │   Sessions      │    │   Uploads       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Deployment

### 1. Environment Setup

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd skill-badge
   ```

2. **Create production environment file:**
   ```bash
   cp backend/.env.production.template backend/.env.production
   ```

3. **Configure environment variables:**
   Edit `backend/.env.production` with your production values:
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/skillbadge_prod"
   REDIS_URL="redis://host:6379"
   JWT_SECRET="your-64-char-secret"
   API_KEY="your-api-key"
   FRONTEND_URL="https://your-domain.com"
   NODE_ENV="production"
   ```

4. **Deploy using Docker Compose:**
   ```bash
   cd backend
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 📦 Deployment Options

### Option 1: Docker Compose (Recommended)

#### Backend Deployment
```bash
cd backend
docker-compose -f docker-compose.prod.yml up --build -d
```

#### Frontend Deployment
```bash
docker-compose -f docker-compose.frontend.yml up --build -d
```

#### Complete Stack
```bash
# Deploy both frontend and backend
docker-compose -f docker-compose.prod.yml -f ../docker-compose.frontend.yml up --build -d
```

### Option 2: Manual Deployment

#### Backend Deployment
```bash
cd backend
npm run build
npm run db:migrate:prod
npm start
```

#### Frontend Deployment
```bash
npm run build
npm start
```

### Option 3: PM2 Process Manager

```bash
cd backend
npm run pm2:start
```

## 🗄️ Database Setup

### PostgreSQL Configuration

1. **Create production database:**
   ```sql
   CREATE DATABASE skillbadge_prod;
   CREATE USER skillbadge_user WITH ENCRYPTED PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE skillbadge_prod TO skillbadge_user;
   ```

2. **Run migrations:**
   ```bash
   npm run db:migrate:prod
   ```

3. **Seed database (optional):**
   ```bash
   npm run db:seed
   ```

### Redis Configuration

Configure Redis with:
- Persistence enabled
- Password protection
- Memory policy: `allkeys-lru`
- Max memory: 1GB (adjust as needed)

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Generate SSL certificates:**
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/key.pem -out ssl/cert.pem
   ```

2. **Update Nginx configuration:**
   - Edit `nginx.conf`
   - Uncomment SSL server block
   - Update domain name

### Environment Variables Security

**Required production variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Strong secret key (64+ chars)
- `API_KEY` - API authentication key

**Generate secure secrets:**
```bash
# Generate JWT secret
openssl rand -base64 64

# Generate API key
openssl rand -hex 32
```

## 📊 Monitoring & Analytics

### Health Checks

The application includes comprehensive health checks:
- **Endpoint:** `GET /health`
- **Detailed:** `GET /health/detailed`
- **Interval:** 30 seconds
- **Timeout:** 5 seconds

### Logging

- **Application logs:** `logs/app.log`
- **Access logs:** Nginx logs
- **Error logs:** Configurable log levels

### Monitoring Integration

Configure these services:
- **Sentry:** Error tracking
- **New Relic:** Performance monitoring
- **Datadog:** Infrastructure monitoring

## 🚀 Scaling Configuration

### Horizontal Scaling

1. **Backend scaling:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --scale app=3
   ```

2. **Database scaling:**
   - Use read replicas for PostgreSQL
   - Configure connection pooling
   - Implement database sharding

3. **Cache scaling:**
   - Redis cluster setup
   - Multiple Redis instances
   - Cache invalidation strategy

### Load Balancing

1. **Nginx configuration:**
   - Multiple upstream servers
   - Health checks
   - Load balancing algorithms

2. **Session management:**
   - Redis-based sessions
   - Sticky sessions (if needed)
   - Session replication

## 🔧 Maintenance

### Backup Strategy

1. **Database backups:**
   - Daily automated backups
   - Point-in-time recovery
   - Backup retention: 30 days

2. **File storage:**
   - Regular file system backups
   - S3/cloud storage integration

### Updates and Upgrades

1. **Application updates:**
   ```bash
   git pull
   npm run build
   npm run db:migrate:prod
   pm2 restart skill-badge-backend
   ```

2. **Database migrations:**
   ```bash
   npm run db:generate
   npm run db:migrate:prod
   ```

### Monitoring Alerts

Set up alerts for:
- Service downtime
- High error rates
- Database connection issues
- High memory usage
- Slow API responses

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection:**
   - Check `DATABASE_URL` format
   - Verify database credentials
   - Ensure database is running

2. **Redis Connection:**
   - Verify `REDIS_URL` configuration
   - Check Redis authentication
   - Ensure Redis is accessible

3. **API Authentication:**
   - Verify `API_KEY` matches frontend configuration
   - Check API key in request headers

4. **CORS Issues:**
   - Update `FRONTEND_URL` in backend config
   - Check CORS origins in frontend requests

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL="debug"
NODE_ENV="development"
```

### Performance Issues

1. **Check database queries**
2. **Monitor Redis performance**
3. **Review API response times**
4. **Check memory usage**

## 📚 API Documentation

### Swagger/OpenAPI

The API is documented using Swagger:
- **URL:** `https://your-domain.com/api-docs`
- **Interactive:** Test endpoints directly
- **Authentication:** API key required

### Postman Collection

Import the Postman collection:
- Collection file: `docs/skill-badge-api.postman.json`
- Environment: `docs/production.postman_environment.json`

## 🚨 Security Checklist

- [ ] SSL certificates installed and configured
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] API keys rotated regularly
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Regular security updates applied

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check database connectivity
4. Review security configurations

---

## 🎉 Deployment Complete!

Your Skill Badge application is now running in production with:

✅ **Secure backend API** with authentication
✅ **PostgreSQL database** with proper schema
✅ **Redis caching** for performance
✅ **Docker containerization** for easy scaling
✅ **Nginx proxy** with SSL support
✅ **Health checks** and monitoring
✅ **Production logging** and error tracking
✅ **API documentation** via Swagger
✅ **Environment-based configuration**
✅ **Security best practices** implemented

The application is ready for production use with proper scalability, security, and monitoring in place.
