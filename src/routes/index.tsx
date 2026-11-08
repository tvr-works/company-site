import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '../components/HomePage';
import { organizationData, pageHead } from '../site';

export const Route = createFileRoute('/')({
  head: () => ({
    ...pageHead(
      '/',
      'TVR Works — Custom Software, Applied AI & Technical Leadership',
      'Custom applications for founders and established businesses. Work directly with Tim VanReenen on software modernization, applied AI, and fractional technical leadership.',
    ),
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(organizationData).replace(/</g, '\\u003c'),
      },
    ],
  }),
  component: HomePage,
});
