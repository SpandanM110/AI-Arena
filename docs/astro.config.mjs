import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'AI Red vs Blue Arena',
      description: 'Complete documentation for the AI Red vs Blue Arena platform',
      social: {
        github: 'https://github.com/your-org/ai-arena',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/intro/' },
            { label: 'Quick Start', link: '/getting-started/quick-start/' },
            { label: 'Installation', link: '/getting-started/installation/' },
            { label: 'Configuration', link: '/getting-started/configuration/' },
          ],
        },
        {
          label: 'Architecture',
          items: [
            { label: 'Overview', link: '/architecture/overview/' },
            { label: 'System Design', link: '/architecture/system-design/' },
            { label: 'Data Flow', link: '/architecture/data-flow/' },
          ],
        },
        {
          label: 'Backend',
          items: [
            { label: 'Overview', link: '/backend/overview/' },
            { label: 'Agents', link: '/backend/agents/' },
            { label: 'Routes & API', link: '/backend/routes/' },
            { label: 'Database', link: '/backend/database/' },
            { label: 'Orchestration', link: '/backend/orchestration/' },
            { label: 'Scoring System', link: '/backend/scoring/' },
            { label: 'WebSocket Server', link: '/backend/websocket/' },
          ],
        },
        {
          label: 'Frontend',
          items: [
            { label: 'Overview', link: '/frontend/overview/' },
            { label: 'Pages', link: '/frontend/pages/' },
            { label: 'Components', link: '/frontend/components/' },
            { label: 'API Client', link: '/frontend/api-client/' },
          ],
        },
        {
          label: 'Integrations',
          items: [
            { label: 'Cline', link: '/integrations/cline/' },
            { label: 'Kestra', link: '/integrations/kestra/' },
            { label: 'Groq Models', link: '/integrations/groq/' },
            { label: 'Oumi', link: '/integrations/oumi/' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Agents API', link: '/api/agents/' },
            { label: 'Matches API', link: '/api/matches/' },
            { label: 'Events API', link: '/api/events/' },
            { label: 'WebSocket API', link: '/api/websocket/' },
            { label: 'Config API', link: '/api/config/' },
            { label: 'Kestra API', link: '/api/kestra/' },
            { label: 'Oumi API', link: '/api/oumi/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Creating Agents', link: '/guides/creating-agents/' },
            { label: 'Running Matches', link: '/guides/running-matches/' },
            { label: 'Tool Execution', link: '/guides/tool-execution/' },
            { label: 'Fine-tuning', link: '/guides/fine-tuning/' },
          ],
        },
        {
          label: 'Deployment',
          items: [
            { label: 'Overview', link: '/deployment/overview/' },
            { label: 'Backend Deployment', link: '/deployment/backend/' },
            { label: 'Frontend Deployment', link: '/deployment/frontend/' },
            { label: 'Kestra Setup', link: '/deployment/kestra/' },
          ],
        },
        {
          label: 'Development',
          items: [
            { label: 'Setup', link: '/development/setup/' },
            { label: 'Contributing', link: '/development/contributing/' },
            { label: 'Testing', link: '/development/testing/' },
          ],
        },
        {
          label: 'Troubleshooting',
          items: [
            { label: 'Common Issues', link: '/troubleshooting/common-issues/' },
            { label: 'Debugging', link: '/troubleshooting/debugging/' },
          ],
        },
      ],
    }),
  ],
});
