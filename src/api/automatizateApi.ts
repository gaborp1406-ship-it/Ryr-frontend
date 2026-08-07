import axios from 'axios';

const automatizateApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  //   headers: {
  //     Authorization:
  //       'bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGktZGlzdHJpYnVjaW9uLWJhY2tlbmQtand0Iiwic3ViIjoiMSIsImlhdCI6MTcxMzM5MDIzMSwiZXhwIjoyMDI4OTY2MjMxfQ.gxqlPejBu-VJanP4CXM9avg6O1D9wvtrhDaJ_0MR3zc',
  //   },
});

//Interceptors
automatizateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { automatizateApi };
