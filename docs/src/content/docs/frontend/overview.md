---
title: Frontend Overview
description: Overview of the Next.js frontend application
---

# Frontend Overview

The frontend is built with Next.js 16 and provides a modern dashboard for the AI Arena.

## Architecture

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React hooks
- **API Client**: Custom fetch wrapper

## Project Structure

```
frontend/
├── app/              # Next.js app router pages
│   ├── page.tsx      # Dashboard
│   ├── agents/       # Agents page
│   ├── matches/      # Matches page
│   ├── settings/     # Settings page
│   └── transcript/   # Transcript page
├── components/       # React components
│   ├── ui/          # UI components (Radix)
│   └── *.tsx        # Feature components
├── lib/              # Utilities
│   ├── api.ts       # API client
│   └── utils.ts     # Helper functions
└── hooks/            # Custom React hooks
```

## Features

- Real-time match monitoring
- Agent management
- Match creation and control
- Event visualization
- Settings configuration

## Next Steps

- [Pages](/frontend/pages/) - Page components
- [Components](/frontend/components/) - React components
- [API Client](/frontend/api-client/) - API integration
