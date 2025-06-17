export class ApiService {
    static readonly baseURL: string = import.meta.env.VITE_SERVER_URL as string

    static {
        console.log('🔧 ApiService initialized with baseURL:', ApiService.baseURL);
        console.log('🌍 Environment variables:', {
            VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
            NODE_ENV: import.meta.env.NODE_ENV,
            MODE: import.meta.env.MODE
        });
    }
}
