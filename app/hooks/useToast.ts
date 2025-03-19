import { toast as hotToast } from 'react-hot-toast';

export const useToast = () => {
  const toast = {
    success: (message: string) => hotToast.success(message),
    error: (message: string) => hotToast.error(message),
    warning: (message: string) => hotToast(message, {
      icon: '⚠️',
      style: {
        backgroundColor: '#FFFBEB',
        color: '#92400E',
        border: '1px solid #FEF3C7',
      },
    }),
    info: (message: string) => hotToast(message, {
      icon: 'ℹ️',
      style: {
        backgroundColor: '#EFF6FF',
        color: '#1E40AF',
        border: '1px solid #DBEAFE',
      },
    })
  };

  return toast;
}; 