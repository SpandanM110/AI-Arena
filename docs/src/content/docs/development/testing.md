---
title: Testing
description: Testing guide
---

# Testing

Guide to testing the AI Arena platform.

## Test Scripts

### End-to-End Test

```bash
.\scripts\test-e2e.ps1
```

### Integration Test

```bash
.\scripts\test-integration.ps1
```

### Verify Setup

```bash
.\scripts\verify-setup.ps1
```

## Manual Testing

### Test Backend

```bash
# Health check
curl http://localhost:3001/health

# List agents
curl http://localhost:3001/api/agents
```

### Test Frontend

1. Open http://localhost:3000
2. Navigate through pages
3. Create agents
4. Run matches

## Next Steps

- [Development Setup](/development/setup/) - Setup guide
- [Contributing](/development/contributing/) - Contribution guide
