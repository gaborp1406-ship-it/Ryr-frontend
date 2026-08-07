// actions/login.action.ts
import type { AuthResponse } from '../interfaces';
import { isAxiosError } from 'axios';
import { automatizateApiNest } from '@/api/automatizateApiNest';

interface resp {
  status: boolean;
  data?: AuthResponse;
  message?: string;
}

export const loginAction = async (usuario: string, contrasenia: string): Promise<resp> => {
  try {
    const { data } = await automatizateApiNest.post<AuthResponse>('/auth/login', {
      usuario,
      contrasenia,
    });

    return {
      status: true,
      data,
    };
  } catch (error) {
    console.error('Error en loginAction:', error);
    if (
      isAxiosError(error) &&
      [400, 401, 403, 422].includes(error.response?.status ?? 0)
    ) {
      return {
        status: false,
        message: error.response?.data?.error || 'Credenciales inválidas',
      };
    }
    throw new Error('No se pudo realizar la petición');
  }
};