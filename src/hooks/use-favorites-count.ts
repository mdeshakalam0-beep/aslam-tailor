import React, { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { getFavoritesCount } from '@/utils/favorites';

export const useFavoritesCount = () => {
  const { session } = useSession();
  const [favoritesCount, setFavoritesCount] = useState(0);

  const fetchCount = async () => {
    if (session?.user) {
      const count = await getFavoritesCount(session.user.id);
      setFavoritesCount(count);
    } else {
      setFavoritesCount(0);
    }
  };

  useEffect(() => {
    fetchCount(); // Fetch count on initial load and session change

    // Listen for custom event to re-fetch count
    window.addEventListener('favorites-updated', fetchCount);
    return () => {
      window.removeEventListener('favorites-updated', fetchCount);
    };
  }, [session]);

  return favoritesCount;
};