import axios from 'axios';
window.axios = axios;

// Configuration du baseURL pour les routes API
window.axios.defaults.baseURL = '/api';

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

// Configuration de l'authentification avec le token Sanctum
const token = localStorage.getItem('token');
if (token) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Intercepteur pour mettre à jour le token dynamiquement
axios.interceptors.request.use(
    (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs 401 (non autorisé)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token invalide, supprimer le token et rediriger vers la page de connexion
            localStorage.removeItem('token');
            window.axios.defaults.headers.common['Authorization'] = '';
            
            // Rediriger vers la page d'accueil si on n'y est pas déjà
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// Import Echo et Pusher pour WebSocket
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Configuration globale d'Echo pour l'authentification
window.EchoConfig = {
    getAuthToken: () => {
        return localStorage.getItem('token');
    }
};
