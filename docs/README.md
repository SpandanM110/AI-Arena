# AI Red vs Blue Arena Documentation

This is the documentation site for the AI Red vs Blue Arena, built with [Astro Starlight](https://starlight.astro.build/).

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The documentation can be deployed to:

- **Vercel**: Connect your GitHub repo
- **Netlify**: Connect your GitHub repo
- **GitHub Pages**: Use GitHub Actions
- **Any static host**: Build and deploy the `dist/` folder

### Vercel Deployment

1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Netlify Deployment

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

## Documentation Structure

All documentation is in `src/content/docs/`:

- `intro.md` - Introduction
- `getting-started/` - Quick start guides
- `architecture/` - System architecture
- `backend/` - Backend documentation
- `frontend/` - Frontend documentation
- `integrations/` - Integration guides
- `api/` - API reference
- `guides/` - User guides
- `deployment/` - Deployment guides
- `development/` - Development guides
- `troubleshooting/` - Troubleshooting

## Adding New Documentation

1. Create a new `.md` file in the appropriate directory
2. Add frontmatter with title and description
3. Add to sidebar in `astro.config.mjs`
4. Write content in Markdown

## Customization

- **Theme**: Edit `astro.config.mjs` for Starlight configuration
- **Styling**: Custom CSS in `src/styles/`
- **Components**: Add React/Vue components as needed
