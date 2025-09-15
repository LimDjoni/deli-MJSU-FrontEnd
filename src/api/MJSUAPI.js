import axios from "axios";

const MJSUAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MJSU_API,
});

export default MJSUAPI;