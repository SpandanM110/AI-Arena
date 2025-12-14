---
title: Debugging
description: Debugging guide
---

# Debugging

Guide to debugging the AI Arena platform.

## Backend Debugging

### Enable Debug Logging

Set environment variable:

```env
DEBUG=*
```

### Check Logs

```bash
# Backend logs
cd backend
pnpm run dev

# Check console output
```

## Frontend Debugging

### Browser DevTools

1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Check Application tab for storage

### React DevTools

Install React DevTools browser extension for component debugging.

## Database Debugging

### Check Database File

```bash
cat backend/data/arena.json
```

### Reset Database

```bash
rm backend/data/arena.json
pnpm run seed
```

## API Debugging

### Test Endpoints

```bash
# Health check
curl http://localhost:3001/health

# List agents
curl http://localhost:3001/api/agents
```

### WebSocket Testing

Use WebSocket client tools or browser console.

## Next Steps

- [Common Issues](/troubleshooting/common-issues/) - Common problems
