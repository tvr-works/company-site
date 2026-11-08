import { createFileRoute } from '@tanstack/react-router';
import { sitePages } from '../site-config';
import { NotFoundPage } from '../components/NotFoundPage';
import { pageHead } from '../site';

export const Route = createFileRoute('/404')({
  head: () => pageHead(sitePages.notFound),
  component: NotFoundPage,
});
