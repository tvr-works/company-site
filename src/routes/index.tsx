import { createFileRoute } from '@tanstack/react-router';
import { sitePages } from '../site-config';
import { HomePage } from '../components/HomePage';
import { organizationData, pageHead } from '../site';

export const Route = createFileRoute('/')({
  head: () => ({
    ...pageHead(sitePages.home),
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(organizationData).replace(/</g, '\\u003c'),
      },
    ],
  }),
  component: HomePage,
});
