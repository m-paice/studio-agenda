import { useState } from "react";

import { api } from "../services/api";

interface Props {
  path: string;
}

export const useRequestCreate = ({ path }: Props) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const execute = (payload: any, params = {}) => {
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
};