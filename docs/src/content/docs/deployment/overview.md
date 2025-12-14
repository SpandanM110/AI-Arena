---
title: Deployment Overview
description: Deployment guide overview
---

# Deployment Overview

Complete guide to deploying the AI Arena platform.

## Deployment Architecture

The platform consists of:

- **Backend**: Express.js API server
- **Frontend**: Next.js application
- **Kestra**: Docker-based orchestration
- **Database**: File-based (can migrate to SQL)

## Deployment Options

### Development

- Local development with hot reload
- All services on localhost
- File-based database

### Production

- Backend on cloud server or container
- Frontend on Vercel/Netlify
- Kestra in Docker container
- Database can be migrated to SQL

## Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and configured
- [ ] Environment variables set
- [ ] API keys configured
- [ ] Kestra running (optional)
- [ ] Database initialized
- [ ] CORS configured correctly
- [ ] WebSocket accessible

## Next Steps

- [Backend Deployment](/deployment/backend/) - Backend setup
- [Frontend Deployment](/deployment/frontend/) - Frontend setup
- [Kestra Setup](/deployment/kestra/) - Kestra configuration
