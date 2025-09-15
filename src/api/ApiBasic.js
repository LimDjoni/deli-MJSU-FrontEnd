import axios from "axios";

export default axios.create({
  baseURL: process.env.NEXT_PUBLIC_MJSU_API,
  auth: {
    username: process.env.NEXT_PUBLIC_USERNAME,
    password: process.env.NEXT_PUBLIC_PASSWORD,
  },
});
