import { getCurrentUser } from '@/lib/auth';
import { SearchContent } from './search-content';

export default async function SearchPage() {
  const user = await getCurrentUser();

  return (
    <SearchContent
      userId={user?.id || null}
      hasPremium={user?.hasPremium || false}
      aiEnabled={user?.aiEnabled || false}
    />
  );
}
