import axios from 'axios';

const envBaseUrl = (import.meta.env.VITE_API_URL_NEST as string | undefined)?.trim();


const resolvedBaseUrl = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : '';

const automatizateApiNest = axios.create({
  baseURL: resolvedBaseUrl,

});

automatizateApiNest.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { automatizateApiNest };
