// Este arquivo centraliza todo o HTML dinâmico da aplicação.

window.templates = {
    // Template do Painel de Administrador
    admin: () => `
        <header class="dashboard-header"><div class="header-content"><div class="header-left"><div class="logo-small">LR</div><div class="header-info"><h1 id="adminWelcome"></h1><p>Gerencie a plataforma</p></div></div><button class="btn-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Sair</button></div></header>
        <div class="dashboard-content">
            <div class="dashboard-tabs">
                <button class="dash-tab-btn active" onclick="showAdminTab('overview')"><i class="fas fa-chart-line"></i> Visão Geral</button>
                <button class="dash-tab-btn" onclick="showAdminTab('users')"><i class="fas fa-users-cog"></i> Usuários</button>
                <button class="dash-tab-btn" onclick="showAdminTab('knowledge')"><i class="fas fa-brain"></i> Cérebro Inteligente</button>
            </div>
            <div id="adminOverviewTab" class="dash-tab-content active"><div class="stats-grid" id="adminStatsGrid"></div></div>
            <div id="adminUsersTab" class="dash-tab-content"><div class="athletes-header"><h3><i class="fas fa-users-cog"></i> Gerenciar Usuários</h3><button class="btn-primary" onclick="showModal('addUserModal')"><i class="fas fa-user-plus"></i> Adicionar Usuário</button></div><div class="users-grid" id="adminUsersList"></div></div>
            <div id="adminKnowledgeTab" class="dash-tab-content"><div class="activities-header"><h3><i class="fas fa-brain"></i> Base de Conhecimento (JSON)</h3><button class="btn-primary" onclick="showModal('uploadKnowledgeModal')"><i class="fas fa-upload"></i> Enviar JSON</button></div><div class="knowledge-list" id="knowledgeList"></div></div>
        </div>
    `,
    // Template do Painel de Professor
    professor: () => `
        <header class="dashboard-header"><div class="header-content"><div class="header-left"><div class="logo-small">LR</div><div class="header-info"><h1 id="professorWelcome"></h1><p>Gerencie seus atletas</p></div></div><button class="btn-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Sair</button></div></header>
        <div class="dashboard-content">
            <div class="dashboard-tabs">
                <button class="dash-tab-btn active" onclick="showProfTab('athletes')"><i class="fas fa-users"></i> Atletas</button>
                <button class="dash-tab-btn" onclick="showProfTab('knowledgeProfessor')"><i class="fas fa-brain"></i> Cérebro Inteligente</button>
            </div>
            <div id="athletesTab" class="dash-tab-content active"><div class="athletes-header"><h3><i class="fas fa-users"></i> Meus Atletas</h3><button class="btn-primary" onclick="showModal('addAthleteModal')"><i class="fas fa-user-plus"></i> Adicionar Atleta</button></div><div class="users-grid" id="athletesList"></div></div>
            <div id="knowledgeProfessorTab" class="dash-tab-content"><div class="knowledge-list" id="knowledgeListProfessor"></div></div>
        </div>
    `,
    // Template do Painel de Atleta
    atleta: () => `
        <header class="dashboard-header"><div class="header-content"><div class="header-left"><div class="logo-small">LR</div><div class="header-info"><h1 id="atletaWelcome"></h1><p>Seu painel de controle</p></div></div><button class="btn-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Sair</button></div></header>
        <div class="dashboard-content">
             <div class="dashboard-tabs">
                <button class="dash-tab-btn active" onclick="showDashTab('overview')"><i class="fas fa-chart-line"></i> Visão Geral</button>
                <button class="dash-tab-btn" onclick="showDashTab('strava')"><i class="fab fa-strava"></i> Strava</button>
                <button class="dash-tab-btn" onclick="showDashTab('knowledgeAthlete')"><i class="fas fa-brain"></i> Cérebro Inteligente</button>
            </div>
            <div id="overviewTab" class="dash-tab-content active"><div class="goals-card"><h3 class="card-title"><i class="fas fa-bullseye"></i> Meus Objetivos</h3><div id="goalsList"></div></div></div>
            <div id="stravaTab" class="dash-tab-content"><div id="stravaCard" class="strava-card"></div></div>
            <div id="knowledgeAthleteTab" class="dash-tab-content"><div class="knowledge-list" id="knowledgeListAthlete"></div></div>
        </div>
    `,
    // Templates de todos os Modais (COM A OPÇÃO DE ADMIN ADICIONADA)
    modals: () => `
        <div id="addUserModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Adicionar Novo Usuário</h3><button class="modal-close" onclick="closeModal('addUserModal')"><i class="fas fa-times"></i></button></div><div class="modal-body"><form id="addUserForm"><div class="form-group"><label for="newUserName">Nome</label><input type="text" id="newUserName" required></div><div class="form-group"><label for="newUserEmail">Email</label><input type="email" id="newUserEmail" required></div><div class="form-group"><label for="newUserPassword">Senha (mín. 6 caracteres)</label><input type="password" id="newUserPassword" required></div><div class="form-group"><label for="newUserPhoto">Foto (Opcional)</label><input type="file" id="newUserPhoto" accept="image/*"></div><div class="form-group"><label>Tipo</label><select id="newUserType" class="form-control"><option value="admin">Administrador</option><option value="professor">Professor</option><option value="atleta">Atleta</option></select></div><div class="modal-actions"><button type="button" class="btn-secondary" onclick="closeModal('addUserModal')">Cancelar</button><button type="submit" class="btn-primary"><span class="btn-text">Adicionar Usuário</span><span class="btn-loading" style="display: none;"><i class="fas fa-spinner fa-spin"></i></span></button></div></form></div></div></div>
        <div id="uploadKnowledgeModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Enviar JSON para o Cérebro</h3><button class="modal-close" onclick="closeModal('uploadKnowledgeModal')"><i class="fas fa-times"></i></button></div><div class="modal-body"><form id="uploadKnowledgeForm"><div class="form-group"><label for="knowledgeTitle">Título do JSON</label><input type="text" id="knowledgeTitle" required></div><div class="form-group"><label for="knowledgeFile">Arquivo (.json)</label><input type="file" id="knowledgeFile" required accept=".json"></div><div class="modal-actions"><button type="button" class="btn-secondary" onclick="closeModal('uploadKnowledgeModal')">Cancelar</button><button type="submit" class="btn-primary"><span class="btn-text">Enviar</span><span class="btn-loading" style="display: none;"><i class="fas fa-spinner fa-spin"></i></span></button></div></form></div></div></div>
        <div id="addAthleteModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Adicionar Novo Atleta</h3><button class="modal-close" onclick="closeModal('addAthleteModal')"><i class="fas fa-times"></i></button></div><div class="modal-body"><form id="addAthleteForm"><div class="form-group"><label for="athleteName">Nome</label><input type="text" id="athleteName" required></div><div class="form-group"><label for="athleteEmail">Email</label><input type="email" id="athleteEmail" required></div><div class="form-group"><label for="athletePassword">Senha (mín. 6 caracteres)</label><input type="password" id="athletePassword" required></div><div class="form-group"><label for="athletePhoto">Foto (Opcional)</label><input type="file" id="athletePhoto" accept="image/*"></div><div class="modal-actions"><button type="button" class="btn-secondary" onclick="closeModal('addAthleteModal')">Cancelar</button><button type="submit" class="btn-primary"><span class="btn-text">Adicionar Atleta</span><span class="btn-loading" style="display: none;"><i class="fas fa-spinner fa-spin"></i></span></button></div></form></div></div></div>
        <div id="goalsModal" class="modal"><div class="modal-content"><div class="modal-header"><h3 id="goalsAthleteName"></h3><button class="modal-close" onclick="closeModal('goalsModal')"><i class="fas fa-times"></i></button></div><div class="modal-body"><form id="goalsForm"><div class="form-group"><label for="weeklyDistance">Distância Semanal (km)</label><input type="number" id="weeklyDistance" step="0.1"></div><div class="form-group"><label for="targetRace">Prova Alvo</label><input type="text" id="targetRace"></div><div class="form-group"><label for="raceDate">Data da Prova</label><input type="date" id="raceDate"></div><div class="modal-actions"><button type="button" class="btn-secondary" onclick="closeModal('goalsModal')">Cancelar</button><button type="submit" class="btn-primary"><span class="btn-text">Salvar</span><span class="btn-loading" style="display: none;"><i class="fas fa-spinner fa-spin"></i></span></button></div></form></div></div></div>
    `
};
