# Documentation Deployment Guide

This guide explains how to deploy the AI Arena documentation site.

## Build the Documentation

```bash
cd docs
npm install
npm run build
```

The built site will be in the `dist/` directory.

## Deployment Options

### Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select the `docs` folder as the root directory

2. **Configure Build Settings**
   - Framework Preset: Astro
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**
   - Click Deploy
   - Your site will be live at `your-project.vercel.app`

### Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Add new site from Git
   - Select your repository

2. **Configure Build Settings**
   - Base directory: `docs`
   - Build command: `npm run build`
   - Publish directory: `docs/dist`

3. **Deploy**
   - Click Deploy site
   - Your site will be live

### GitHub Pages

1. **Install GitHub Actions**
   - Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [ main ]
    paths:
      - 'docs/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd docs
          npm install
      - name: Build
        run: |
          cd docs
          npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/dist
```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select GitHub Actions as source
   - Your site will be at `username.github.io/repo-name`

### Static Hosting

You can deploy to any static host:

1. Build the site: `npm run build`
2. Upload the `dist/` folder to your host
3. Configure your host to serve the `dist/` folder

## Custom Domain

### Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify

1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records

## Environment Variables

No environment variables are needed for the documentation site.

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:
- Push to main branch → Auto deploy
- Pull requests → Preview deployments

## Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Run `npm install` locally first
- Check for TypeScript errors

### 404 Errors

- Ensure `dist/` is the output directory
- Check base path configuration in `astro.config.mjs`

### Styling Issues

- Clear build cache
- Rebuild the site
- Check for CSS import errors
