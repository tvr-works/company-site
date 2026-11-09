import { createFileRoute } from '@tanstack/react-router';
import { SoftwarePage } from '../components/SoftwarePage';
import { pageHead } from '../site';
import { sitePages } from '../site-config';

export const Route = createFileRoute('/software')({
  head: () => pageHead(sitePages.software),
  component: SoftwarePage,
});
