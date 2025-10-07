import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from './lib/firebase';
import Login from './components/Login';
import AtletaDashboard from './components/AtletaDashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados completos do usuário no database
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name,
              type: userData.type
            });
          } else {
            // Se não encontrar dados, fazer logout
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.type === 'atleta') {
    return <AtletaDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.type === 'professor') {
    return <ProfessorDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tipo de usuário não reconhecido</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Fazer logout
        </button>
      </div>
    </div>
  );
}

export default App;
