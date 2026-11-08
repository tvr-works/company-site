import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPage } from '../components/PrivacyPage';
import { pageHead } from '../site';

export const Route = createFileRoute('/privacy')({
  head: () =>
    pageHead(
      '/privacy',
      'Privacy — TVR Works',
      'How TVR Works LLC handles website visits, hosting information, and project inquiries.',
    ),
  component: PrivacyPage,
});
