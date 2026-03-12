import axios, { AxiosError } from 'axios';
import { ApiError, ApiErrorResponse } from '../types/error.types';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 30000,
});

// Armazenar a função de notificação (será setada pelo App)
let notificationCallback: ((notification: any) => void) | null = null;

export const setErrorNotificationCallback = (callback: (notification: any) => void) => {
  notificationCallback = callback;
};

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('[API Error]', error);

    const data = error.response?.data as ApiErrorResponse;

    let message = 'Erro ao processar requisição';
    let errorType = 'error';

    if (error.response) {
      // Status 4xx ou 5xx
      const status = error.response.status;

      const messageValue = data?.message;
      if (status === 400) {
        message = Array.isArray(messageValue)
          ? messageValue.join(', ')
          : messageValue || 'Requisição inválida';
      } else if (status === 401) {
        message = Array.isArray(messageValue)
          ? messageValue.join(', ')
          : messageValue || 'Sessão expirada. Faça login novamente.';
        // Redirecionar para login?
      } else if (status === 403) {
        message = Array.isArray(messageValue)
          ? messageValue.join(', ')
          : messageValue || 'Acesso negado';
      } else if (status === 404) {
        message = Array.isArray(messageValue)
          ? messageValue.join(', ')
          : messageValue || 'Recurso não encontrado';
      } else if (status === 409) {
        message = Array.isArray(messageValue)
          ? messageValue.join(', ')
          : messageValue || 'Conflito nos dados';
      } else if (status >= 500) {
        message = 'Erro no servidor. Tente novamente mais tarde.';
      } else {
        message = Array.isArray(messageValue)
          ? messageValue.join(', ')
          : messageValue || 'Erro ao buscar dados';
      }

      // Notificar usuário
      if (notificationCallback) {
        notificationCallback({
          message,
          type: errorType,
        });
      }

      throw new ApiError(status, message, error.message, data);
    } else if (error.request) {
      // Request feito mas sem resposta
      message = 'Erro de conexão. Verifique sua internet.';

      if (notificationCallback) {
        notificationCallback({
          message,
          type: 'warning',
        });
      }

      throw new ApiError(0, message, 'Network Error', error);
    } else {
      // Erro ao configurar request
      message = 'Erro ao processar requisição';

      if (notificationCallback) {
        notificationCallback({
          message,
          type: 'error',
        });
      }

      throw new ApiError(0, message, error.message, error);
    }
  },
);

export default api;
