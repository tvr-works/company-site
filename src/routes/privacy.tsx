import { createFileRoute } from '@tanstack/react-router';
import { sitePages } from '../site-config';
import { PrivacyPage } from '../components/PrivacyPage';
import { pageHead } from '../site';

export const Route = createFileRoute('/privacy')({
  head: () => pageHead(sitePages.privacy),
  component: PrivacyPage,
});
