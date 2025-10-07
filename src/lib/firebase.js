import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase com os valores reais fornecidos
const firebaseConfig = {
  apiKey: "AIzaSyAvNlifcwHV6qPh9cKCJTQoJM2bMkGl2HQ",
  authDomain: "lerunners-4725f.firebaseapp.com",
  databaseURL: "https://lerunners-4725f-default-rtdb.firebaseio.com",
  projectId: "lerunners-4725f",
  storageBucket: "lerunners-4725f.firebasestorage.app",
  messagingSenderId: "490740324975",
  appId: "1:490740324975:web:c354dcdcd334c049a58b9a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const database = getDatabase(app);
export const auth = getAuth(app);

export default app;
