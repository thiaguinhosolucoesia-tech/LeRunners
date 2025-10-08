async function loadAdminDashboard() {
    document.getElementById("adminWelcome").textContent = `Olá, ${window.appState.currentUser.name || 'Admin'}!`;
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('uploadKnowledgeForm').addEventListener('submit', handleUploadKnowledge);
    await loadAdminUsers();
    await loadKnowledgeBase('knowledgeList');
}

function showAdminTab(tabName) {
    document.querySelectorAll("#adminDashboard .dash-tab-btn").forEach(btn => btn.classList.remove("active"));
    event.currentTarget.classList.add("active");
    document.querySelectorAll("#adminDashboard .dash-tab-content").forEach(content => content.classList.remove("active"));
    document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add("active");
}

async function loadAdminUsers() {
    const usersRef = database.ref("users");
    usersRef.on("value", (snapshot) => {
        const users = snapshot.val() || {};
        const listDiv = document.getElementById("adminUsersList");
        if(!listDiv) return;
        listDiv.innerHTML = "";
        
        let totalUsers = 0, totalProfessors = 0, totalAthletes = 0;
        Object.values(users).forEach(user => {
            if (user.type !== 'admin') totalUsers++;
            if (user.type === 'professor') totalProfessors++;
            if (user.type === 'atleta') totalAthletes++;
        });

        document.getElementById('adminStatsGrid').innerHTML = `
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-info"><h3>${totalUsers}</h3><p>Usuários Totais</p></div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-user-tie"></i></div><div class="stat-info"><h3>${totalProfessors}</h3><p>Professores</p></div></div>
            <div class="stat-card"><div class="stat-icon"><i class="fas fa-running"></i></div><div class="stat-info"><h3>${totalAthletes}</h3><p>Atletas</p></div></div>
        `;
    });
}

async function handleAddUser(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    const name = document.getElementById("newUserName").value;
    const email = document.getElementById("newUserEmail").value;
    const password = document.getElementById("newUserPassword").value;
    const type = document.getElementById("newUserType").value;
    const photoFile = document.getElementById("newUserPhoto").files[0];
    let photoURL = "https://res.cloudinary.com/dpaayfwlj/image/upload/v1728399345/user_on2xvx.png";

    try {
        if (photoFile) photoURL = await uploadToCloudinary(photoFile);

        const secondaryApp = firebase.initializeApp(FIREBASE_CONFIG, `secondary-auth-${Date.now()}`);
        const cred = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
        await database.ref(`users/${cred.user.uid}`).set({ name, email, type, photoURL, createdAt: new Date().toISOString() });
        await secondaryApp.delete();
        showSuccess(`Usuário ${name} criado!`);
        closeModal('addUserModal');
        e.target.reset();
    } catch (error) {
        showError(getErrorMessage(error));
    } finally {
        setButtonLoading(btn, false);
    }
}

async function handleUploadKnowledge(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    const title = document.getElementById("knowledgeTitle").value;
    const file = document.getElementById("knowledgeFile").files[0];
    try {
        if (!file) throw new Error("Nenhum arquivo .json selecionado.");
        if(file.type !== 'application/json') throw new Error("O arquivo precisa ser .json.");
        const fileURL = await uploadToCloudinary(file);
        await database.ref("knowledge").push({ title, fileName: file.name, fileURL, uploadedAt: new Date().toISOString() });
        showSuccess("Arquivo JSON enviado!");
        closeModal('uploadKnowledgeModal');
        e.target.reset();
    } catch (error) {
        showError("Falha no upload: " + error.message);
    } finally {
        setButtonLoading(btn, false);
    }
}