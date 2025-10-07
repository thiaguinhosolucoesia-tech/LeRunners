import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../lib/firebase';
import { getStravaAuthUrl, exchangeCodeForToken, getAthleteActivities, getAthleteData } from '../lib/strava';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Calendar, 
  Clock, 
  MapPin, 
  Target, 
  Trophy, 
  Zap,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

const AtletaDashboard = ({ user, onLogout }) => {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaData, setStravaData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState(null);

  useEffect(() => {
    checkStravaConnection();
    loadGoals();
    
    // Verificar se há código de autorização do Strava na URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleStravaCallback(code);
    }
  }, [user.uid]);

  const checkStravaConnection = async () => {
    try {
      const userRef = ref(database, `users/${user.uid}/strava`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const stravaInfo = snapshot.val();
        setStravaConnected(true);
        setStravaData(stravaInfo);
        if (stravaInfo.accessToken) {
          loadActivities(stravaInfo.accessToken);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conexão Strava:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const goalsRef = ref(database, `users/${user.uid}/goals`);
      const snapshot = await get(goalsRef);
      if (snapshot.exists()) {
        setGoals(snapshot.val());
      }
    } catch (error) {
      console.error('Erro ao carregar objetivos:', error);
    }
  };

  const handleStravaCallback = async (code) => {
    setLoading(true);
    try {
      const tokenData = await exchangeCodeForToken(code);
      const athleteData = await getAthleteData(tokenData.access_token);
      
      // Salvar dados do Strava no Firebase
      await set(ref(database, `users/${user.uid}/strava`), {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        athleteId: athleteData.id,
        athleteName: athleteData.firstname + ' ' + athleteData.lastname,
        connectedAt: new Date().toISOString()
      });

      setStravaConnected(true);
      setStravaData({
        athleteId: athleteData.id,
        athleteName: athleteData.firstname + ' ' + athleteData.lastname
      });

      loadActivities(tokenData.access_token);
      
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Erro ao processar callback do Strava:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (accessToken) => {
    try {
      const activitiesData = await getAthleteActivities(accessToken, 1, 10);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const connectStrava = () => {
    window.location.href = getStravaAuthUrl();
  };

  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(2) + ' km';
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateWeeklyProgress = () => {
    if (!goals || !activities.length) return 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyDistance = activities
      .filter(activity => new Date(activity.start_date) >= oneWeekAgo)
      .reduce((total, activity) => total + activity.distance, 0) / 1000;
    
    return Math.min((weeklyDistance / goals.weeklyDistance) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">LeRunners</h1>
                <p className="text-sm text-gray-500">Olá, {user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
            <TabsTrigger value="goals">Objetivos</TabsTrigger>
            <TabsTrigger value="strava">Strava</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Atividades esta semana</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activities.filter(a => {
                      const activityDate = new Date(a.start_date);
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      return activityDate >= oneWeekAgo;
                    }).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Distância total</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatDistance(activities.reduce((total, a) => total + a.distance, 0))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo total</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatDuration(activities.reduce((total, a) => total + a.moving_time, 0))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progresso semanal */}
            {goals && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Progresso Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Meta: {goals.weeklyDistance} km</span>
                      <span>{calculateWeeklyProgress().toFixed(1)}%</span>
                    </div>
                    <Progress value={calculateWeeklyProgress()} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{activity.name}</h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(activity.start_date)} • {activity.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatDistance(activity.distance)}</p>
                          <p className="text-sm text-gray-500">{formatDuration(activity.moving_time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma atividade encontrada. Conecte sua conta Strava para ver suas atividades.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Seus Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goals ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">Meta Semanal</h3>
                        <p className="text-2xl font-bold text-blue-600">{goals.weeklyDistance} km</p>
                      </div>
                      {goals.targetRace && (
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">Prova Alvo</h3>
                          <p className="font-semibold">{goals.targetRace}</p>
                          <p className="text-sm text-gray-500">{goals.raceDate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum objetivo definido. Entre em contato com seu treinador para definir suas metas.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strava" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Integração Strava
                </CardTitle>
                <CardDescription>
                  Conecte sua conta Strava para sincronizar automaticamente suas atividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stravaConnected ? (
                  <div className="space-y-4">
                    <Alert>
                      <Trophy className="h-4 w-4" />
                      <AlertDescription>
                        Conta Strava conectada com sucesso! Atleta: {stravaData?.athleteName}
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={() => checkStravaConnection()} 
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Sincronizar Atividades
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Conectar Strava</h3>
                    <p className="text-gray-500 mb-6">
                      Conecte sua conta Strava para importar automaticamente suas corridas e treinos
                    </p>
                    <Button onClick={connectStrava} disabled={loading}>
                      {loading ? 'Conectando...' : 'Conectar com Strava'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AtletaDashboard;
