# StockMaster - Inventory Management System

StockMaster is a modular inventory management platform for warehouse teams, inventory managers, and operators who need to track products, stock movements, and warehouse activity in one place. It supports secure authentication, product management, inventory tracking, and dashboard reporting for day-to-day operations.

## Project Overview

StockMaster helps teams manage stock across vendors, warehouses, customers, and production areas. The application includes OTP-based authentication, role-aware access, operational workflows for receipts and deliveries, and a real-time dashboard for visibility into stock levels and pending operations.

Main features include:
- User authentication with OTP verification and JWT sessions
- Product management with CRUD operations
- Inventory tracking across multiple locations
- Warehouse workflows for receipts, deliveries, transfers, and adjustments
- KPI dashboard for operational insight
- User profile management

## Architecture Diagram

```text
Users │ Route53 │ CloudFront │ AWS WAF │ ALB │ ECS Fargate │ PostgreSQL + Redis + S3
```

## Tech Stack

- React
- Vite
- Express
- PostgreSQL
- Docker
- AWS ECS
- RDS
- CloudFront
- GitHub Actions
- Redis

## Features

- User authentication
- Product management
- Inventory tracking
- Warehouse management
- Dashboard
- JWT authentication
- OTP-based registration and login flow
- Request logging, rate limiting, compression, and security headers

## Folder Structure

```text
stockmaster/
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── logger.js
│   ├── index.js
│   └── seed.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── api.js
│   └── vite.config.js
└── README.md
```

## Installation

```bash
git clone <repository-url>
cd odooxspit_online
npm install
npm run dev
```

Use `npm install` inside `backend/` and `frontend/` if you prefer installing dependencies per app.

## Environment Variables

Create `backend/.env` and define the required variables without committing the file to source control:

- `PORT`
- `NODE_ENV`
- `LOG_LEVEL`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `DATABASE_URL`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `PGSSLMODE`
- `ALLOWED_ORIGINS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`
- `COMPRESSION_LEVEL`
- `JSON_LIMIT`
- `REDIS_URL`

## Docker

The backend is container-friendly and can be started with Docker Compose when the service definitions are present:

```bash
docker compose up
```

This is useful for local development and for matching production-style runtime behavior.

## AWS Deployment

The target deployment flow is designed for AWS:
- Users access the app through Route53 and CloudFront
- AWS WAF protects the edge layer
- The frontend and API can be served behind an ALB
- Backend containers run on ECS Fargate
- PostgreSQL runs on RDS
- Redis is used for caching and health/status checks
- S3 can store static assets or uploads
- GitHub Actions can automate build and deployment

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- OTP verification with expiry
- Explicit CORS origins
- Rate limiting for general and authentication endpoints
- Security headers via Helmet
- Request compression
- Structured logging with redaction for secrets

## Future Improvements

- Notifications
- Analytics
- Multi-tenancy
- Kubernetes deployment

## Support

For questions or issues, open a GitHub issue or contact the team members listed above.



