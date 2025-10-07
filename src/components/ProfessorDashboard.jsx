import { useState, useEffect } from 'react';
import { ref, get, set, push, remove } from 'firebase/database';
import { database } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  Calendar,
  Activity,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';

const ProfessorDashboard = ({ user, onLogout }) => {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [newAthlete, setNewAthlete] = useState({ name: '', email: '', phone: '' });
  const [goals, setGoals] = useState({ weeklyDistance: '', targetRace: '', raceDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAthletes();
  }, [user.uid]);

  const loadAthletes = async () => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        const athletesList = Object.entries(users)
          .filter(([_, userData]) => userData.type === 'atleta')
          .map(([uid, userData]) => ({ uid, ...userData }));
        
        // Carregar dados adicionais dos atletas (objetivos, atividades do Strava)
        const athletesWithData = await Promise.all(
          athletesList.map(async (athlete) => {
            const goalsRef = ref(database, `users/${athlete.uid}/goals`);
            const stravaRef = ref(database, `users/${athlete.uid}/strava`);
            
            const [goalsSnapshot, stravaSnapshot] = await Promise.all([
              get(goalsRef),
              get(stravaRef)
            ]);
            
            return {
              ...athlete,
              goals: goalsSnapshot.exists() ? goalsSnapshot.val() : null,
              strava: stravaSnapshot.exists() ? stravaSnapshot.val() : null
            };
          })
        );
        
        setAthletes(athletesWithData);
      }
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
    }
  };

  const handleAddAthlete = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Criar entrada para o atleta (simulado - em produção seria via convite)
      const athleteRef = push(ref(database, 'athletes'));
      await set(athleteRef, {
        ...newAthlete,
        professorId: user.uid,
        createdAt: new Date().toISOString(),
        status: 'pending' // Pendente até o atleta se cadastrar
      });
      
      setNewAthlete({ name: '', email: '', phone: '' });
      setShowAddAthlete(false);
      loadAthletes();
    } catch (error) {
      console.error('Erro ao adicionar atleta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetGoals = async (e) => {
    e.preventDefault();
    if (!selectedAthlete) return;
    
    setLoading(true);
    try {
      await set(ref(database, `users/${selectedAthlete.uid}/goals`), {
        weeklyDistance: parseFloat(goals.weeklyDistance),
        targetRace: goals.targetRace,
        raceDate: goals.raceDate,
        setBy: user.uid,
        setAt: new Date().toISOString()
      });
      
      setShowEditGoals(false);
      loadAthletes();
    } catch (error) {
      console.error('Erro ao definir objetivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGoalsDialog = (athlete) => {
    setSelectedAthlete(athlete);
    setGoals({
      weeklyDistance: athlete.goals?.weeklyDistance || '',
      targetRace: athlete.goals?.targetRace || '',
      raceDate: athlete.goals?.raceDate || ''
    });
    setShowEditGoals(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
                <h1 className="text-xl font-semibold text-gray-900">LeRunners - Professor</h1>
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
        <Tabs defaultValue="athletes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="athletes">Atletas</TabsTrigger>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="training">Planos de Treino</TabsTrigger>
          </TabsList>

          <TabsContent value="athletes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Meus Atletas</h2>
              <Dialog open={showAddAthlete} onOpenChange={setShowAddAthlete}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Atleta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Atleta</DialogTitle>
                    <DialogDescription>
                      Adicione as informações do atleta. Ele receberá um convite para se cadastrar na plataforma.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAthlete} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={newAthlete.name}
                        onChange={(e) => setNewAthlete({...newAthlete, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAthlete.email}
                        onChange={(e) => setNewAthlete({...newAthlete, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newAthlete.phone}
                        onChange={(e) => setNewAthlete({...newAthlete, phone: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddAthlete(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Adicionando...' : 'Adicionar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {athletes.map((athlete) => (
                <Card key={athlete.uid} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{athlete.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        {athlete.strava && (
                          <Badge variant="secondary" className="text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Strava
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>{athlete.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {athlete.goals ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Meta Semanal:</span>
                          <span className="font-medium">{athlete.goals.weeklyDistance} km</span>
                        </div>
                        {athlete.goals.targetRace && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Prova Alvo:</span>
                            <span className="font-medium">{athlete.goals.targetRace}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <Target className="h-4 w-4" />
                        <AlertDescription>
                          Nenhum objetivo definido
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openGoalsDialog(athlete)}
                        className="flex-1"
                      >
                        <Target className="w-4 h-4 mr-1" />
                        Objetivos
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Treinos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {athletes.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atleta cadastrado</h3>
                  <p className="text-gray-500 mb-6">
                    Comece adicionando seus primeiros atletas à plataforma
                  </p>
                  <Button onClick={() => setShowAddAthlete(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Atleta
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{athletes.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conectados ao Strava</CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {athletes.filter(a => a.strava).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Com Objetivos</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {athletes.filter(a => a.goals).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Atividade Hoje</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumo dos Atletas</CardTitle>
              </CardHeader>
              <CardContent>
                {athletes.length > 0 ? (
                  <div className="space-y-4">
                    {athletes.map((athlete) => (
                      <div key={athlete.uid} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{athlete.name}</h3>
                            <p className="text-sm text-gray-500">{athlete.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {athlete.strava && (
                            <Badge variant="secondary">Strava</Badge>
                          )}
                          {athlete.goals && (
                            <Badge variant="outline">Objetivos</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum atleta cadastrado ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planos de Treino</CardTitle>
                <CardDescription>
                  Funcionalidade em desenvolvimento. Em breve você poderá criar e gerenciar planos de treino personalizados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Em Breve</h3>
                  <p className="text-gray-500">
                    Esta funcionalidade estará disponível em uma próxima atualização
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para definir objetivos */}
      <Dialog open={showEditGoals} onOpenChange={setShowEditGoals}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Objetivos - {selectedAthlete?.name}</DialogTitle>
            <DialogDescription>
              Configure os objetivos e metas para este atleta
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetGoals} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weeklyDistance">Meta Semanal (km)</Label>
              <Input
                id="weeklyDistance"
                type="number"
                step="0.1"
                value={goals.weeklyDistance}
                onChange={(e) => setGoals({...goals, weeklyDistance: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetRace">Prova Alvo</Label>
              <Input
                id="targetRace"
                value={goals.targetRace}
                onChange={(e) => setGoals({...goals, targetRace: e.target.value})}
                placeholder="Ex: Maratona de São Paulo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raceDate">Data da Prova</Label>
              <Input
                id="raceDate"
                type="date"
                value={goals.raceDate}
                onChange={(e) => setGoals({...goals, raceDate: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditGoals(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Objetivos'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessorDashboard;
