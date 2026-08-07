import { automatizateApi } from '@/api/automatizateApi';
import { isAxiosError } from 'axios';
import { base64ToFile } from './base64ToFile.utils';
import type { dataArchivo } from '../interfaces/archivo.interface';

interface resp {
  status: boolean;
  data?: dataArchivo;
  message?: string;
}

export const generarURLBase64 = async (base64String: string, fileName: string): Promise<resp> => {
  const archivo = base64ToFile(base64String, fileName); // Asegúrate de importar base64ToFile aquí
  const formData = new FormData();
  formData.append('file', archivo); // 'file' es el nombre que tu backend espera

  try {
    const { data } = await automatizateApi.post<resp>('/setting/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      status: true,
      data: data.data,
    };
  } catch (error) {
    if (
      isAxiosError(error) &&
      (error.response?.status == 400 ||
        error.response?.status == 401 ||
        error.response?.status == 422)
    ) {
      const errorMessage = error.response?.data?.error || ''; // Default message
      return {
        status: false,
        message: errorMessage,
      };
    }

    throw new Error('No se pudo realizar la petición');
  }
};
