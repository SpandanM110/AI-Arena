---
title: Backend Deployment
description: Backend deployment guide
---

# Backend Deployment

Guide to deploying the backend API server.

## Prerequisites

- Node.js 18+
- pnpm or npm
- Environment variables configured

## Build

```bash
cd backend
pnpm install
pnpm run build
```

## Environment Variables

Set all required environment variables:

```env
PORT=3001
WS_PORT=3002
CORS_ORIGIN=https://your-frontend-domain.com
DATABASE_PATH=./data/arena.json
GROQ_API_KEY=your_key
# ... other variables
```

## Deployment Options

### PM2

```bash
pm2 start dist/index.js --name ai-arena-backend
```

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001 3002
CMD ["node", "dist/index.js"]
```

### Cloud Platforms

- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **Fly.io**: Use fly CLI
- **AWS/GCP/Azure**: Use container services

## Health Checks

The backend provides health check endpoint:

```bash
GET /health
```

## Next Steps

- [Frontend Deployment](/deployment/frontend/) - Frontend setup
