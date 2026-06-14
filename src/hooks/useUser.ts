import { useState, useEffect } from 'react';
import { mockUser } from '../data/mockUser';
import { User } from '../types';

const fakeApiCall = (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUser);
    }, 800); // simula latenza di rete
  });
};

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fakeApiCall()
      .then(data => setUser(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
};
