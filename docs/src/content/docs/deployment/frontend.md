---
title: Frontend Deployment
description: Frontend deployment guide
---

# Frontend Deployment

Guide to deploying the Next.js frontend.

## Prerequisites

- Node.js 18+
- pnpm or npm
- Backend API accessible

## Build

```bash
cd frontend
pnpm install
pnpm run build
```

## Environment Variables

Set in `.env.production` or deployment platform:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend-api.com
```

## Deployment Options

### Vercel (Recommended)

1. Connect GitHub repository
2. Set build command: `pnpm run build`
3. Set environment variables
4. Deploy

### Netlify

1. Connect GitHub repository
2. Set build command: `pnpm run build`
3. Set publish directory: `.next`
4. Set environment variables
5. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Next Steps

- [Backend Deployment](/deployment/backend/) - Backend setup
