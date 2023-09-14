import axios from "axios";
import qs from "qs";

const nodeEnv = {
  development: "http://localhost:3333",
  production: "https://api.meupetrecho.com.br",
};

export function api() {
  return axios.create({
    baseURL: `${nodeEnv["development"]}/api/v1`,
    paramsSerializer: (params) => qs.stringify(params),
  });
}
