import Toast from 'react-native-toast-message';

export type ToastTone = 'success' | 'error' | 'info';

function show(type: ToastTone, message: string) {
    Toast.show({ type, text1: message, visibilityTime: 2600 });
}

export const toast = {
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message),
    info: (message: string) => show('info', message),
};
