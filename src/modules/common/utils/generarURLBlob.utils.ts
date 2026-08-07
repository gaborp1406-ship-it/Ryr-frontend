import { automatizateApi } from '@/api/automatizateApi';
import { isAxiosError } from 'axios';
import type { dataArchivo } from '../interfaces/archivo.interface';

interface resp {
  status: boolean;
  data?: dataArchivo;
  message?: string;
}

export const generarURLBlob = async (dataBlob: Blob, fileName: string): Promise<resp> => {
  // Crear el archivo usando el nombre
  const archivo = new File([dataBlob], fileName, { type: 'image/jpeg' });

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
