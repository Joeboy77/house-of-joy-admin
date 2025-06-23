import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data) {
      if (typeof error.response.data === 'object' && error.response.data.errors) {
        return error.response.data.errors.map((err: { defaultMessage: string }) => err.defaultMessage).join(', ');
      }
      return JSON.stringify(error.response.data);
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}; 