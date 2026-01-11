import { defineStore } from 'pinia';
import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import axios from 'axios';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dummy-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123'
};

let app = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization error (variables may not be configured):', error);
  // Firebase ne sera pas disponible mais l'app peut quand même fonctionner
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const isLoading = ref(false);
  
  async function loginWithGoogle() {
    try {
      if (!auth) {
        if (window.showNotification) {
          window.showNotification('Firebase n\'est pas configuré. Veuillez configurer les variables d\'environnement.', 'error');
        }
        return false;
      }
      
      isLoading.value = true;
      
      const provider = new GoogleAuthProvider();
      console.log('🔵 Firebase config:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain
      });
      
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Firebase sign-in successful:', {
        email: result.user.email,
        uid: result.user.uid
      });
      
      // Récupérer le token Firebase
      const firebaseToken = await result.user.getIdToken();
      console.log('🔑 Token Firebase généré:', firebaseToken.substring(0, 50) + '...');
      
      // Envoyer au backend Laravel
      console.log('🔑 Envoi du token Firebase au backend...');
      const response = await axios.post('/auth/firebase', {
        token: firebaseToken
      }).catch(error => {
        console.error('❌ Erreur lors de l\'envoi au backend:', error.response?.data || error.message);
        throw error;
      });
      
      console.log('✅ Réponse du backend:', response.data);
      const data = response.data;
      
      if (data.success && data.token && data.user) {
        // Sauvegarder le token
        token.value = data.token;
        localStorage.setItem('token', data.token);
        
        // Sauvegarder les infos utilisateur (IMPORTANT : avant le return)
        user.value = data.user;
        
        console.log('✅ Connexion réussie, utilisateur:', data.user);
        console.log('✅ Token sauvegardé:', data.token.substring(0, 20) + '...');
        
        return true;
      }
      
      console.error('❌ Réponse invalide:', data);
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (window.showNotification) {
        const errorMessage = error.response?.data?.message || 'Erreur de connexion';
        window.showNotification(errorMessage, 'error');
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  function logout() {
    if (auth) {
      auth.signOut();
    }
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }
  
  async function checkAuth() {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      // Récupérer les infos utilisateur
      try {
        await fetchUserInfo();
      } catch (error) {
        // Si l'erreur est 401, le token est invalide, on le supprime
        // Sinon, on laisse le token et on continue (l'utilisateur pourra réessayer)
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          token.value = null;
        }
      }
    }
  }
  
  async function fetchUserInfo() {
    const response = await axios.get('/user');
    
    if (response.data) {
      user.value = response.data;
      return response.data;
    }
    
    throw new Error('No user data received');
  }
  
  return {
    user,
    token,
    isLoading,
    loginWithGoogle,
    logout,
    checkAuth,
    fetchUserInfo
  };
});

