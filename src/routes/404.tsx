import { createFileRoute } from '@tanstack/react-router';
import { NotFoundPage } from '../components/NotFoundPage';
import { pageHead } from '../site';

export const Route = createFileRoute('/404')({
  head: () =>
    pageHead(
      '/404',
      'Page not found — TVR Works',
      'This page could not be found. Return to TVR Works.',
    ),
  component: NotFoundPage,
});
