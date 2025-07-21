import axios from "axios";

const MrpAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MRP_API,
});

export default MrpAPI;