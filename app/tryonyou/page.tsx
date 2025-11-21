import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategories } from '@/actions/products';
import TryOnYouClient from './try-on-you-client';

export default async function TryOnYouPage() {
  const user = await getCurrentUser();

  // Redirect to Clerk sign-in if not authenticated
  if (!user) {
    // Use Clerk's local sign-in route with redirect back to /tryonyou
    redirect(`/sign-in?redirect_url=${encodeURIComponent('http://localhost:3000/tryonyou')}`);
    return null;
  }

  const categories = await getCategories();

  // Optionally pass user as prop if needed
  return <TryOnYouClient user={user} categories={categories} />;
}
