import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/client';

export function useApi(endpoint, initialParams = {}, executeOnMount = true) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(executeOnMount);
  const [error, setError] = useState(null);

  const execute = useCallback(async (params = initialParams) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use our native fetch wrapper
      const response = await apiFetch(endpoint, { 
        method: 'GET', 
        params: params 
      });
      setData(response);
      setError(null)
    } catch (err) {
      setError(err.message || 'Data fetch failed');
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (executeOnMount) {
      setError(null)
      execute();
    }
  }, [execute, executeOnMount]);

  return { data, isLoading, error, execute };
}