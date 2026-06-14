import { redirect } from 'next/navigation';

// The full left-sidebar + phones browsing interface is now on the Homepage (/)
// Redirect here for convenience
export default function SearchRedirect() {
  redirect('/');
}
