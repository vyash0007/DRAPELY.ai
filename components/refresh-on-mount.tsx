'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function RefreshOnMount() {
  const router = useRouter();

  useEffect(() => {
    // Trigger a refresh to update the navbar cart count
    router.refresh();
  }, [router]);

  return null;
}
