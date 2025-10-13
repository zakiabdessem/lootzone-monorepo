import axios from "axios";
import { BACKEND_URL } from "./router";

export const instance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});


export { axios };
