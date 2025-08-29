import axios from "axios";

export const api = axios.create({
  baseURL: "https://gobblet-gobblers-backend.onrender.com", // later replace with env
  headers: { "Content-Type": "application/json" },
});
