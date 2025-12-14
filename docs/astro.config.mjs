import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'AI Red vs Blue Arena',
      description: 'Complete documentation for the AI Red vs Blue Arena platform',
      social: {
        github: 'https://github.com/SpandanM110/AI-Arena',
      },
      sidebar: [
        {
          label: 'Introduction',
          link: '/intro/',
        },
        {
          label: 'Getting Started',
          autogenerate: {
            directory: 'getting-started',
          },
        },
        {
          label: 'Architecture',
          autogenerate: {
            directory: 'architecture',
          },
        },
        {
          label: 'Backend',
          autogenerate: {
            directory: 'backend',
          },
        },
        {
          label: 'Frontend',
          autogenerate: {
            directory: 'frontend',
          },
        },
        {
          label: 'Integrations',
          autogenerate: {
            directory: 'integrations',
          },
        },
        {
          label: 'API Reference',
          autogenerate: {
            directory: 'api',
          },
        },
        {
          label: 'Guides',
          autogenerate: {
            directory: 'guides',
          },
        },
        {
          label: 'Deployment',
          autogenerate: {
            directory: 'deployment',
          },
        },
        {
          label: 'Development',
          autogenerate: {
            directory: 'development',
          },
        },
        {
          label: 'Troubleshooting',
          autogenerate: {
            directory: 'troubleshooting',
          },
        },
      ],
    }),
  ],
});
