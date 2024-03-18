import { useState } from "react";

import { api } from "../services/api";

interface Props {
  path: string;
  //id: string;
  callbackSuccess?: () => void;
}

export function useRequestDestroy({ path, callbackSuccess }: Props) {
  const [response, setResponse] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const execute = (id: string) => {
    setLoading(true);
    setError(false);

    api()
      .delete(`${path}/${id}`)
      .then(() => {
        if (callbackSuccess) callbackSuccess();
        setResponse(true);

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
