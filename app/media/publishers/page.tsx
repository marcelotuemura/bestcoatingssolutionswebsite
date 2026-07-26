import { redirect } from 'next/navigation';

/**
 * /media/publishers — alias for /media/publications.
 * Redirects to keep the nav alias working.
 */
export default function MediaPublishersPage() {
  redirect('/media/publications');
}
