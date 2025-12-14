---
title: Development Setup
description: Development environment setup
---

# Development Setup

Guide to setting up a development environment.

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Git
- Docker (for Kestra, optional)

## Clone Repository

```bash
git clone https://github.com/SpandanM110/AI-Arena.git
cd AI-Arena
```

## Install Dependencies

### Backend

```bash
cd backend
pnpm install
```

### Frontend

```bash
cd frontend
pnpm install
```

## Environment Setup

### Backend

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### Frontend

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

## Start Development Servers

### Backend

```bash
cd backend
pnpm run dev
```

### Frontend

```bash
cd frontend
pnpm run dev
```

## Seed Database

```bash
cd backend
pnpm run seed
```

## Next Steps

- [Contributing](/development/contributing/) - Contribution guide
- [Testing](/development/testing/) - Testing guide
