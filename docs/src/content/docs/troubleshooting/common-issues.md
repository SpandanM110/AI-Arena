---
title: Common Issues
description: Common problems and solutions
---

# Common Issues

Solutions to common problems.

## Backend Not Starting

**Problem**: Backend fails to start

**Solutions**:
- Check if port 3001 is available
- Verify database directory exists
- Check environment variables
- Review error logs

## Frontend Not Connecting

**Problem**: Frontend can't connect to backend

**Solutions**:
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS settings
- Check browser console for errors

## WebSocket Not Working

**Problem**: WebSocket connection fails

**Solutions**:
- Check if port 3002 is available
- Verify WebSocket server started
- Check browser WebSocket connection
- Review WebSocket server logs

## Model Rate Limits

**Problem**: Rate limit errors

**Solutions**:
- System automatically tries fallback models
- Wait for rate limit reset
- Use different API keys for different teams
- Upgrade Groq plan

## Database Issues

**Problem**: Database errors

**Solutions**:
- Delete `backend/data/arena.json`
- Restart backend
- Run seed script: `pnpm run seed`

## Next Steps

- [Debugging](/troubleshooting/debugging/) - Debugging guide
