document.addEventListener('DOMContentLoaded', function () {
    // --- Seletores do DOM ---
    const userNameElement = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const professorView = document.getElementById('professor-view');
    const atletaView = document.getElementById('atleta-view');
    const newsView = document.getElementById('news-view');
    const hubSubView = document.getElementById('hub-sub-view');
    const managementSubView = document.getElementById('management-sub-view');
    const showAddAthleteBtn = document.getElementById('show-add-athlete-form-btn');
    const addAthleteContainer = document.getElementById('add-athlete-container');
    const cancelAddAthleteBtn = document.getElementById('cancel-add-athlete-btn');
    const addAthleteForm = document.getElementById('add-athlete-form');
    const athleteGridContainer = document.getElementById('athlete-grid-container');
    const backToHubBtn = document.getElementById('back-to-hub-btn');
    const managementAthleteName = document.getElementById('management-athlete-name');
    const prescribeTrainingForm = document.getElementById('prescribe-training-form');
    const trainingPlanList = document.getElementById('training-plan-list');
    const athleteProfileForm = document.getElementById('athlete-profile-form');
    const myTrainingPlanList = document.getElementById('my-training-plan-list');
    const myProfileForm = document.getElementById('my-profile-form');
    const addRaceForm = document.getElementById('add-race-form');
    const racesList = document.getElementById('races-list');
    const myRacesList = document.getElementById('my-races-list');
    const performanceChart = document.getElementById('performance-chart');
    const myPerformanceChart = document.getElementById('my-performance-chart');
    const smartSuggestions = document.getElementById('smart-suggestions');
    const newsList = document.getElementById('news-list');
    const calendarList = document.getElementById('calendar-list');
    const vitrineList = document.getElementById('vitrine-list');
    const commentsSection = document.getElementById('comments-section');
    const newCommentInput = document.getElementById('new-comment');
    const postCommentBtn = document.getElementById('post-comment-btn');
    const commentsList = document.getElementById('comments-list');

    // Elementos específicos para integração com Strava
    const stravaConnectBtn = document.getElementById('strava-connect-btn');
    const stravaStatusElement = document.getElementById('strava-status');
    const stravaActivitiesList = document.getElementById('strava-activities-list');
    const myStravaActivitiesList = document.getElementById('my-strava-activities');

    let currentManagingAthleteId = null;
    let currentUserData = null;

    // --- Configurações do Strava ---
    const STRAVA_CONFIG = {
        clientId: '138742', // Substitua pelo seu Client ID do Strava
        redirectUri: window.location.origin + '/dashboard.html',
        scope: 'read,activity:read_all,profile:read_all', // Adicionado profile:read_all
        authUrl: 'https://www.strava.com/oauth/authorize'
    };

    // --- Lógica Principal de Inicialização ---
    function checkSessionAndInitialize() {
        const sessionDataString = localStorage.getItem('currentUserSession');
        if (!sessionDataString) {
            window.location.href = 'index.html';
            return;
        }
        const sessionData = JSON.parse(sessionDataString);
        currentUserData = sessionData;
        initializeDashboard(sessionData);
        
        // Verificar se há código de autorização do Strava na URL
        checkStravaCallback();
    }

    function initializeDashboard(userData) {
        userNameElement.textContent = `Olá, ${userData.name}`;
        if (userData.role === 'professor') {
            professorView.style.display = 'block';
            showProfessorSubView('hub');
            setupProfessorEventListeners();
            loadAthletesGrid();
            loadNews();
            loadCalendar();
            loadVitrine();
        } else {
            atletaView.style.display = 'block';
            // CORREÇÃO: Buscar o atletaId correto baseado no login
            findAthleteIdAndLoadDashboard(userData.name);
            loadNews();
            loadCalendar();
            loadVitrine();
        }
    }

    // --- CORREÇÃO PRINCIPAL: Função para encontrar o ID do atleta ---
    function findAthleteIdAndLoadDashboard(athleteName) {
        const atletasRef = database.ref('atletas');
        atletasRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                let athleteId = null;
                snapshot.forEach(childSnapshot => {
                    const atleta = childSnapshot.val();
                    if (atleta.nome === athleteName) {
                        athleteId = childSnapshot.key;
                        return true; // Para sair do forEach
                    }
                });
                
                if (athleteId) {
                    currentUserData.atletaId = athleteId;
                    loadAthleteDashboard(athleteId);
                    setupStravaIntegration(athleteId);
                } else {
                    console.error('Atleta não encontrado na base de dados');
                    alert('Erro: Perfil de atleta não encontrado. Contacte o professor.');
                }
            }
        });
    }

    function showProfessorSubView(subViewName) {
        if (subViewName === 'hub') {
            hubSubView.style.display = 'block';
            managementSubView.style.display = 'none';
        } else if (subViewName === 'management') {
            hubSubView.style.display = 'none';
            managementSubView.style.display = 'block';
        }
    }

    // --- Funções do Professor ---
    function setupProfessorEventListeners() {
        showAddAthleteBtn.addEventListener('click', () => {
            addAthleteContainer.style.display = 'block';
            showAddAthleteBtn.style.display = 'none';
        });

        cancelAddAthleteBtn.addEventListener('click', () => {
            addAthleteContainer.style.display = 'none';
            showAddAthleteBtn.style.display = 'block';
            addAthleteForm.reset();
        });

        addAthleteForm.addEventListener('submit', handleAddAthlete);

        backToHubBtn.addEventListener('click', () => {
            showProfessorSubView('hub');
            currentManagingAthleteId = null;
        });

        athleteGridContainer.addEventListener('click', (e) => {
            const manageButton = e.target.closest('.manage-athlete-btn');
            if (manageButton) {
                const athleteId = manageButton.dataset.atletaId;
                openManagementPanel(athleteId);
            }
        });
    }

    async function handleAddAthlete(e) {
        e.preventDefault();
        const name = document.getElementById('athlete-name').value.trim();
        const password = document.getElementById('athlete-password').value.trim();
        if (!name || !password) return;

        try {
            const newLoginRef = database.ref('logins').push();
            await newLoginRef.set({ name, password, role: 'atleta' });

            const athleteKey = newLoginRef.key;
            await database.ref('atletas/' + athleteKey).set({
                nome: name,
                perfil: { objetivo: 'Não definido', rp5k: '' },
                plano_treino: {},
                provas: {},
                comentarios: {},
                atividades_strava: {},
                strava_connected: false,
                strava_athlete_id: null
            });

            alert(`Atleta '${name}' cadastrado com sucesso!`);
            addAthleteForm.reset();
            addAthleteContainer.style.display = 'none';
            showAddAthleteBtn.style.display = 'block';
            loadAthletesGrid();
        } catch (error) {
            console.error("Erro ao cadastrar atleta:", error);
            alert("Falha ao cadastrar atleta. Verifique o console para detalhes.");
        }
    }

    function loadAthletesGrid() {
        const atletasRef = database.ref('atletas');
        atletasRef.on('value', (snapshot) => {
            athleteGridContainer.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const atleta = childSnapshot.val();
                    const atletaId = childSnapshot.key;
                    const stravaStatus = atleta.strava_connected ? '🟢 Conectado' : '🔴 Desconectado';
                    athleteGridContainer.innerHTML += `
                        <div class="athlete-card">
                            <h3 class="font-bold text-xl text-gray-800">${atleta.nome}</h3>
                            <div class="mt-4 space-y-2 text-sm text-gray-600">
                                <p><strong>Objetivo:</strong> ${atleta.perfil.objetivo || 'Não definido'}</p>
                                <p><strong>RP 5km:</strong> ${atleta.perfil.rp5k || 'N/A'}</p>
                                <p><strong>Strava:</strong> ${stravaStatus}</p>
                            </div>
                            <div class="mt-6 text-right">
                                <button data-atleta-id="${atletaId}" class="form-button manage-athlete-btn" style="width: auto; padding: 0.5rem 1rem;">Gerir Atleta</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                athleteGridContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center">Nenhum atleta cadastrado. Clique em "+ Adicionar Aluno" para começar.</p>';
            }
        });
    }

    // --- Funções do Painel de Gestão Individual ---
    function openManagementPanel(athleteId) {
        currentManagingAthleteId = athleteId;
        showProfessorSubView('management');

        const atletaRef = database.ref('atletas/' + athleteId);
        atletaRef.on('value', (snapshot) => {
            if (!snapshot.exists()) return;
            const atleta = snapshot.val();
            managementAthleteName.textContent = `Gerindo: ${atleta.nome}`;
            loadProfileData(atleta.perfil);
            loadTrainingPlan(athleteId);
            loadRaces(athleteId);
            loadPerformanceChart(athleteId);
            loadSmartSuggestions(athleteId);
            loadStravaActivities(athleteId); // Nova função para mostrar atividades do Strava

            prescribeTrainingForm.onsubmit = (e) => handlePrescribeTraining(e);
            athleteProfileForm.onsubmit = (e) => handleUpdateProfile(e);
            addRaceForm.onsubmit = (e) => handleAddRace(e, athleteId);
        });
    }

    function loadProfileData(perfil) {
        if (!perfil) return;
        document.getElementById('athlete-goal').value = perfil.objetivo || '';
        document.getElementById('athlete-rp-5k').value = perfil.rp5k || '';
    }

    function loadTrainingPlan(athleteId) {
        const planRef = database.ref(`atletas/${athleteId}/plano_treino`).orderByChild('data');
        planRef.on('value', (snapshot) => {
            trainingPlanList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const treino = childSnapshot.val();
                    const statusBadge = treino.status === 'realizado' ? 
                        '<span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">✓ Realizado</span>' :
                        '<span style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">⏳ Agendado</span>';
                    
                    trainingPlanList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <p><strong>${new Date(treino.data + 'T03:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}:</strong> ${treino.tipo}</p>
                                ${statusBadge}
                            </div>
                            <p class="text-sm text-gray-600">${treino.descricao}</p>
                        </div>
                    `;
                });
            } else {
                trainingPlanList.innerHTML = '<p class="text-gray-500">Nenhum treino agendado.</p>';
            }
        });
    }

    async function handlePrescribeTraining(e) {
        e.preventDefault();
        if (!currentManagingAthleteId) return;

        const newTraining = {
            data: document.getElementById('training-date').value,
            tipo: document.getElementById('training-type').value,
            descricao: document.getElementById('training-description').value,
            status: 'agendado',
            timestamp: Date.now()
        };

        try {
            await database.ref(`atletas/${currentManagingAthleteId}/plano_treino`).push().set(newTraining);
            alert('Treino agendado com sucesso!');
            prescribeTrainingForm.reset();
            loadTrainingPlan(currentManagingAthleteId);
        } catch (error) {
            console.error("Erro ao agendar treino:", error);
            alert('Falha ao agendar treino. Verifique o console.');
        }
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();
        if (!currentManagingAthleteId) return;

        const updatedProfile = {
            objetivo: document.getElementById('athlete-goal').value,
            rp5k: document.getElementById('athlete-rp-5k').value
        };

        try {
            await database.ref(`atletas/${currentManagingAthleteId}/perfil`).update(updatedProfile);
            alert('Perfil do atleta atualizado com sucesso!');
            loadProfileData(updatedProfile);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert('Falha ao atualizar perfil. Verifique o console.');
        }
    }

    function loadRaces(athleteId) {
        const racesRef = database.ref(`atletas/${athleteId}/provas`);
        racesRef.on('value', (snapshot) => {
            racesList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const prova = childSnapshot.val();
                    racesList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${prova.nome}</strong> - ${new Date(prova.data + 'T03:00:00Z').toLocaleDateString('pt-BR')}</p>
                            <p class="text-sm text-gray-600">Resultado: ${prova.resultado || 'N/A'}</p>
                        </div>
                    `;
                });
            } else {
                racesList.innerHTML = '<p class="text-gray-500">Nenhuma prova registrada.</p>';
            }
        });
    }

    async function handleAddRace(e, athleteId) {
        e.preventDefault();
        const name = document.getElementById('race-name').value.trim();
        const date = document.getElementById('race-date').value;
        const result = document.getElementById('race-result').value.trim();
        if (!name || !date) return;

        try {
            const newRaceRef = database.ref(`atletas/${athleteId}/provas`).push();
            await newRaceRef.set({ nome: name, data: date, resultado: result });
            alert('Prova registrada com sucesso!');
            addRaceForm.reset();
            loadRaces(athleteId);
        } catch (error) {
            console.error("Erro ao registrar prova:", error);
            alert('Falha ao registrar prova.');
        }
    }

    function loadPerformanceChart(athleteId) {
        const chartContainer = document.getElementById('performance-chart');
        chartContainer.innerHTML = '<p class="text-center text-gray-500">Gráfico de desempenho em desenvolvimento...</p>';
    }

    function loadSmartSuggestions(athleteId) {
        const suggestionsContainer = document.getElementById('smart-suggestions');
        suggestionsContainer.innerHTML = '<p class="text-gray-500">Analisando desempenho...</p>';

        setTimeout(() => {
            suggestionsContainer.innerHTML = `
                <div class="p-3 bg-blue-100 rounded">
                    <p><strong>Sugestão Inteligente:</strong> Baseado no seu objetivo de correr meia maratona em 1h45, recomendamos aumentar a frequência de treinos intervalados nas próximas 4 semanas.</p>
                </div>
            `;
        }, 1000);
    }

    // --- NOVA FUNÇÃO: Carregar atividades do Strava para o professor ---
    function loadStravaActivities(athleteId) {
        const stravaActivitiesContainer = document.getElementById('strava-activities-list');
        if (!stravaActivitiesContainer) return;

        const stravaRef = database.ref(`atletas/${athleteId}/atividades_strava`);
        stravaRef.on('value', (snapshot) => {
            stravaActivitiesContainer.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const atividade = childSnapshot.val();
                    const data = new Date(atividade.start_date).toLocaleDateString('pt-BR');
                    const distancia = (atividade.distance / 1000).toFixed(2);
                    const tempo = formatDuration(atividade.moving_time);
                    
                    stravaActivitiesContainer.innerHTML += `
                        <div class="p-3 bg-green-50 border border-green-200 rounded">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 class="font-bold">${atividade.name}</h4>
                                <span class="text-xs text-green-600">Strava</span>
                            </div>
                            <p class="text-sm text-gray-600">${data} • ${distancia}km • ${tempo}</p>
                            <p class="text-sm text-gray-500">${atividade.type}</p>
                        </div>
                    `;
                });
            } else {
                stravaActivitiesContainer.innerHTML = '<p class="text-gray-500">Nenhuma atividade do Strava sincronizada.</p>';
            }
        });
    }

    // --- Funções do Atleta (CORRIGIDAS) ---
    function loadAthleteDashboard(athleteId) {
        const atletaRef = database.ref('atletas/' + athleteId);
        atletaRef.on('value', (snapshot) => {
            if (!snapshot.exists()) return;
            const atleta = snapshot.val();
            loadMyProfileData(atleta.perfil);
            loadMyTrainingPlan(athleteId);
            loadMyRaces(athleteId);
            loadMyPerformanceChart(athleteId);
            loadComments(athleteId);
            loadMyStravaActivities(athleteId);

            // Configurar event listeners para o atleta
            if (myProfileForm) {
                myProfileForm.onsubmit = (e) => handleUpdateMyProfile(e, athleteId);
            }
            
            document.addEventListener('click', (e) => {
                const markDoneBtn = e.target.closest('.mark-as-done-btn');
                if (markDoneBtn) {
                    const treinoId = markDoneBtn.dataset.treinoId;
                    updateTrainingStatus(athleteId, treinoId, 'realizado');
                }
            });
            
            if (postCommentBtn) {
                postCommentBtn.addEventListener('click', () => handlePostComment(athleteId));
            }
        });
    }

    function loadMyProfileData(perfil) {
        if (!perfil) return;
        const myGoalElement = document.getElementById('my-goal');
        const myRp5kElement = document.getElementById('my-rp-5k');
        
        if (myGoalElement) myGoalElement.value = perfil.objetivo || '';
        if (myRp5kElement) myRp5kElement.value = perfil.rp5k || '';
    }

    function loadMyTrainingPlan(athleteId) {
        const planRef = database.ref(`atletas/${athleteId}/plano_treino`).orderByChild('data');
        planRef.on('value', (snapshot) => {
            if (!myTrainingPlanList) return;
            
            myTrainingPlanList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const treino = childSnapshot.val();
                    const statusClass = treino.status === 'realizado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                    const actionButton = treino.status !== 'realizado' ? 
                        `<button data-treino-id="${childSnapshot.key}" class="mark-as-done-btn form-button" style="width: auto; padding: 0.5rem 1rem;">Marcar como Realizado</button>` : 
                        '<span class="text-green-600 font-bold">✓ Concluído</span>';
                    
                    myTrainingPlanList.innerHTML += `
                        <div class="p-3 ${statusClass} rounded flex justify-between items-center">
                            <div>
                                <p><strong>${new Date(treino.data + 'T03:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}:</strong> ${treino.tipo}</p>
                                <p class="text-sm text-gray-600">${treino.descricao}</p>
                            </div>
                            ${actionButton}
                        </div>
                    `;
                });
            } else {
                myTrainingPlanList.innerHTML = '<p class="text-gray-500">Nenhum treino agendado pelo seu professor.</p>';
            }
        });
    }

    async function updateTrainingStatus(athleteId, treinoId, status) {
        try {
            await database.ref(`atletas/${athleteId}/plano_treino/${treinoId}`).update({ 
                status: status,
                data_realizacao: status === 'realizado' ? new Date().toISOString().split('T')[0] : null
            });
            
            // Adicionar à vitrine quando um treino é marcado como realizado
            if (status === 'realizado') {
                const treinoRef = database.ref(`atletas/${athleteId}/plano_treino/${treinoId}`);
                treinoRef.once('value', async (snapshot) => {
                    const treino = snapshot.val();
                    await database.ref('vitrine').push().set({
                        autor: currentUserData.name,
                        descricao: `Completou o treino: ${treino.tipo} - ${treino.descricao}`,
                        timestamp: Date.now(),
                        tipo: 'treino_realizado'
                    });
                });
            }
            
            alert('Status do treino atualizado com sucesso!');
            loadMyTrainingPlan(athleteId);
        } catch (error) {
            console.error("Erro ao atualizar status do treino:", error);
            alert('Falha ao atualizar status do treino.');
        }
    }

    async function handleUpdateMyProfile(e, athleteId) {
        e.preventDefault();
        const updatedProfile = {
            objetivo: document.getElementById('my-goal').value,
            rp5k: document.getElementById('my-rp-5k').value
        };

        try {
            await database.ref(`atletas/${athleteId}/perfil`).update(updatedProfile);
            alert('Seu perfil foi atualizado com sucesso!');
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert('Falha ao atualizar perfil.');
        }
    }

    function loadMyRaces(athleteId) {
        const racesRef = database.ref(`atletas/${athleteId}/provas`);
        racesRef.on('value', (snapshot) => {
            if (!myRacesList) return;
            
            myRacesList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const prova = childSnapshot.val();
                    myRacesList.innerHTML += `
                        <div class="p-3 bg-gray-100 rounded">
                            <p><strong>${prova.nome}</strong> - ${new Date(prova.data + 'T03:00:00Z').toLocaleDateString('pt-BR')}</p>
                            <p class="text-sm text-gray-600">Resultado: ${prova.resultado || 'N/A'}</p>
                        </div>
                    `;
                });
            } else {
                myRacesList.innerHTML = '<p class="text-gray-500">Nenhuma prova registrada.</p>';
            }
        });
    }

    function loadMyPerformanceChart(athleteId) {
        if (!myPerformanceChart) return;
        myPerformanceChart.innerHTML = '<p class="text-center text-gray-500">Carregando gráfico...</p>';
    }

    function loadComments(athleteId) {
        const commentsRef = database.ref(`atletas/${athleteId}/comentarios`);
        commentsRef.on('value', (snapshot) => {
            if (!commentsList) return;
            
            commentsList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const comment = childSnapshot.val();
                    commentsList.innerHTML += `
                        <div class="comment-item">
                            <p><strong>${comment.autor}:</strong> ${comment.texto}</p>
                            <p class="text-xs text-gray-500">${new Date(comment.timestamp).toLocaleString('pt-BR')}</p>
                        </div>
                    `;
                });
            }
        });
    }

    async function handlePostComment(athleteId) {
        const commentText = newCommentInput.value.trim();
        if (!commentText) return;

        try {
            await database.ref(`atletas/${athleteId}/comentarios`).push().set({
                autor: currentUserData.name,
                texto: commentText,
                timestamp: Date.now()
            });
            newCommentInput.value = '';
            loadComments(athleteId);
        } catch (error) {
            console.error("Erro ao postar comentário:", error);
        }
    }

    // --- INTEGRAÇÃO COM STRAVA ---
    function setupStravaIntegration(athleteId) {
        if (stravaConnectBtn) {
            stravaConnectBtn.addEventListener('click', () => connectToStrava());
        }
        checkStravaConnectionStatus(athleteId);
    }

    function connectToStrava() {
        const authUrl = `${STRAVA_CONFIG.authUrl}?client_id=${STRAVA_CONFIG.clientId}&response_type=code&redirect_uri=${encodeURIComponent(STRAVA_CONFIG.redirectUri)}&approval_prompt=force&scope=${STRAVA_CONFIG.scope}&state=${currentUserData.atletaId}`;
        window.location.href = authUrl;
    }

    function checkStravaCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            console.error('Erro na autorização do Strava:', error);
            return;
        }

        if (code && state) {
            exchangeCodeForToken(code, state);
            // Limpar a URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    async function exchangeCodeForToken(code, athleteId) {
        try {
            // Em um ambiente real, esta chamada deveria ser feita através de um backend
            // Por segurança, o client_secret não deve estar no frontend
            const response = await fetch('https://www.strava.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: STRAVA_CONFIG.clientId,
                    client_secret: 'seu_client_secret_aqui', // ATENÇÃO: Mover para backend
                    code: code,
                    grant_type: 'authorization_code'
                })
            });

            const data = await response.json();
            
            if (data.access_token) {
                // Salvar token e informações do atleta
                await database.ref(`atletas/${athleteId}`).update({
                    strava_connected: true,
                    strava_athlete_id: data.athlete.id,
                    strava_access_token: data.access_token,
                    strava_refresh_token: data.refresh_token,
                    strava_expires_at: data.expires_at,
                    strava_athlete_name: data.athlete.firstname + ' ' + data.athlete.lastname // Salvar nome do atleta Strava
                });

                alert('Conectado ao Strava com sucesso!');
                checkStravaConnectionStatus(athleteId);
                loadRecentStravaActivities(athleteId, data.access_token);
            }
        } catch (error) {
            console.error('Erro ao trocar código por token:', error);
            alert('Erro ao conectar com o Strava. Tente novamente.');
        }
    }

    function checkStravaConnectionStatus(athleteId) {
        database.ref(`atletas/${athleteId}/strava_connected`).on('value', (snapshot) => {
            const isConnected = snapshot.val();
            if (stravaStatusElement) {
                stravaStatusElement.textContent = isConnected ? '🟢 Conectado ao Strava' : '🔴 Não conectado';
            }
            if (stravaConnectBtn) {
                stravaConnectBtn.textContent = isConnected ? 'Reconectar Strava' : 'Conectar ao Strava';
            }
        });
    }

    async function loadRecentStravaActivities(athleteId, accessToken) {
        try {
            const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=10`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const activities = await response.json();
            
            // Salvar atividades no Firebase
            for (const activity of activities) {
                await database.ref(`atletas/${athleteId}/atividades_strava/${activity.id}`).set({
                    id: activity.id,
                    name: activity.name,
                    type: activity.type,
                    distance: activity.distance,
                    moving_time: activity.moving_time,
                    start_date: activity.start_date,
                    average_speed: activity.average_speed,
                    max_speed: activity.max_speed,
                    sync_timestamp: Date.now()
                });

                // Adicionar à vitrine
                await database.ref('vitrine').push().set({
                    autor: currentUserData.name,
                    descricao: `Completou atividade no Strava: ${activity.name} - ${(activity.distance / 1000).toFixed(2)}km`,
                    timestamp: Date.now(),
                    tipo: 'atividade_strava'
                });
            }

            loadMyStravaActivities(athleteId);
        } catch (error) {
            console.error('Erro ao carregar atividades do Strava:', error);
        }
    }

    function loadMyStravaActivities(athleteId) {
        const stravaActivitiesContainer = document.getElementById('my-strava-activities');
        if (!stravaActivitiesContainer) return;

        const stravaRef = database.ref(`atletas/${athleteId}/atividades_strava`).limitToLast(5);
        stravaRef.on('value', (snapshot) => {
            stravaActivitiesContainer.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const atividade = childSnapshot.val();
                    const data = new Date(atividade.start_date).toLocaleDateString('pt-BR');
                    const distancia = (atividade.distance / 1000).toFixed(2);
                    const tempo = formatDuration(atividade.moving_time);
                    
                    stravaActivitiesContainer.innerHTML += `
                        <div class="p-3 bg-orange-50 border border-orange-200 rounded">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 class="font-bold">${atividade.name}</h4>
                                <span class="text-xs text-orange-600">Strava</span>
                            </div>
                            <p class="text-sm text-gray-600">${data} • ${distancia}km • ${tempo}</p>
                            <p class="text-sm text-gray-500">${atividade.type}</p>
                        </div>
                    `;
                });
            } else {
                stravaActivitiesContainer.innerHTML = '<p class="text-gray-500">Conecte ao Strava para ver suas atividades aqui.</p>';
            }
        });
    }

    // --- Funções Auxiliares ---
    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h${minutes.toString().padStart(2, '0')}m${secs.toString().padStart(2, '0')}s`;
        } else {
            return `${minutes}m${secs.toString().padStart(2, '0')}s`;
        }
    }

    // --- Funções de Notícias, Calendário e Vitrine (mantidas do código original) ---
    function loadNews() {
        const newsRef = database.ref('noticias').limitToLast(5);
        newsRef.on('value', (snapshot) => {
            if (!newsList) return;
            newsList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const noticia = childSnapshot.val();
                    newsList.innerHTML += `
                        <div class="news-card">
                            <h3 class="font-bold">${noticia.titulo}</h3>
                            <p class="text-sm text-gray-600">${noticia.resumo}</p>
                            <p class="text-xs text-gray-500 mt-2">${new Date(noticia.timestamp).toLocaleDateString('pt-BR')}</p>
                        </div>
                    `;
                });
            } else {
                newsList.innerHTML = '<p class="text-gray-500">Nenhuma notícia disponível.</p>';
            }
        });
    }

    function loadCalendar() {
        const calendarRef = database.ref('calendario').limitToLast(5);
        calendarRef.on('value', (snapshot) => {
            if (!calendarList) return;
            calendarList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const evento = childSnapshot.val();
                    calendarList.innerHTML += `
                        <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                            <p class="font-bold">${evento.titulo}</p>
                            <p class="text-sm text-gray-600">${new Date(evento.data + 'T03:00:00Z').toLocaleDateString('pt-BR')}</p>
                        </div>
                    `;
                });
            } else {
                calendarList.innerHTML = '<p class="text-gray-500">Nenhum evento agendado.</p>';
            }
        });
    }

    function loadVitrine() {
        const vitrineRef = database.ref('vitrine').limitToLast(10);
        vitrineRef.on('value', (snapshot) => {
            if (!vitrineList) return;
            vitrineList.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const atividade = childSnapshot.val();
                    vitrineList.innerHTML += `
                        <div class="vitrine-item">
                            <div class="vitrine-header">
                                <strong>${atividade.autor}</strong>
                                <span>${new Date(atividade.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                            <p>${atividade.descricao}</p>
                            <div class="vitrine-actions">
                                <button class="form-button" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">👍</button>
                                <button class="form-button" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">💬</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                vitrineList.innerHTML = '<p class="text-gray-500">Nenhuma atividade na vitrine.</p>';
            }
        });
    }

    // --- Funções Gerais ---
    function logoutUser() {
        localStorage.removeItem('currentUserSession');
        window.location.href = 'index.html';
    }

    logoutBtn.addEventListener('click', logoutUser);
    checkSessionAndInitialize();
});
