// actions/check-auth.action.ts
import type { AuthCheckStatus } from '../interfaces';
import { isAxiosError } from 'axios';
import { automatizateApiNest } from '@/api/automatizateApiNest';

interface CheckStatusApiResponse {
  auth: boolean;
  token: string;
  usuario: AuthCheckStatus;
}

interface resp {
  status: boolean;
  data?: AuthCheckStatus;
  message?: string;
}

export const checkAuthAction = async (token: string): Promise<resp> => {
  console.log('checkAuthAction ejecutándose con token:', token);
  try {
    if (!token || token.length < 10) {
      return { status: false };
    }

    const { data } = await automatizateApiNest.get<CheckStatusApiResponse>('/auth/checkstatus');

    if (!data.auth) {
      return { status: false };
    }

    return {
      status: true,
      data: { ...data.usuario, token: data.token },
    };
  } catch (error) {
    console.error('checkAuthAction error:', error);
    if (
      isAxiosError(error) &&
      [400, 401, 422].includes(error.response?.status ?? 0)
    ) {
      return {
        status: false,
        message: error.response?.data?.error || '',
      };
    }
    throw new Error('No se pudo realizar la petición');
  }
};