import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // later replace with env
  headers: { "Content-Type": "application/json" },
});
