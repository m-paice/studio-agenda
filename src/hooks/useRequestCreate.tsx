import { useState } from "react";

import { api } from "../services/api";

interface Props {
  path: string;
}

export function useRequestCreate<T>({ path }: Props) {
  const [response, setResponse] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const execute = (payload: T, params = {}) => {
    setLoading(true);

    api()
      .post(path, payload, {
        params,
      })
      .then(({ data }) => {
        setResponse(data);

        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setResponse(null);

        setError(true);
        setLoading(false);
      });
  };

  return {
    execute,
    response,
    error,
    loading,
  };
}
