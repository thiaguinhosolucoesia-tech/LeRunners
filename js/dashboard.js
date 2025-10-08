async function loadProfessorDashboard() {
    document.getElementById("professorWelcome").textContent = `Olá, ${window.appState.currentUser.name}!`;
    document.getElementById('addAthleteForm').addEventListener('submit', handleAddAthlete);
    document.getElementById('goalsForm').addEventListener('submit', handleSetGoals);
    await loadProfessorAthletes();
    await loadKnowledgeBase('knowledgeListProfessor');
}

async function loadAthleteDashboard() {
    document.getElementById("atletaWelcome").textContent = `Olá, ${window.appState.currentUser.name}!`;
    document.getElementById('stravaCard').addEventListener('click', (e) => {
        if (e.target.id === 'connectStravaBtn') connectStrava();
    });
    await checkStravaConnection();
    await loadAthleteGoals();
    await loadKnowledgeBase('knowledgeListAthlete');
}

async function loadProfessorAthletes() {
    const ref = database.ref("users").orderByChild("professorUid").equalTo(window.appState.currentUser.uid);
    ref.on("value", (snapshot) => {
        const athletes = snapshot.val() || {};
        const listDiv = document.getElementById("athletesList");
        if(!listDiv) return;
        listDiv.innerHTML = "";
        if (Object.keys(athletes).length > 0) {
            Object.keys(athletes).forEach(uid => {
                const athlete = { uid, ...athletes[uid] };
                const card = document.createElement("div");
                card.className = "user-card";
                card.innerHTML = `<img src="${athlete.photoURL}" alt="Foto de ${athlete.name}" class="user-photo">
                                  <div class="user-info"><h3>${athlete.name}</h3><p>${athlete.email}</p></div>
                                  <div class="user-actions"><button class="btn-secondary" onclick="openGoalsModal('${uid}', '${athlete.name}')"><i class="fas fa-bullseye"></i> Metas</button></div>`;
                listDiv.appendChild(card);
            });
        } else {
            listDiv.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><p>Nenhum atleta cadastrado.</p></div>`;
        }
    });
}

async function handleAddAthlete(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    const name = document.getElementById("athleteName").value;
    const email = document.getElementById("athleteEmail").value;
    const password = document.getElementById("athletePassword").value;
    const photoFile = document.getElementById("athletePhoto").files[0];
    let photoURL = "https://res.cloudinary.com/dpaayfwlj/image/upload/v1728399345/user_on2xvx.png";

    try {
        if (photoFile) photoURL = await uploadToCloudinary(photoFile);
        const secondaryApp = firebase.initializeApp(FIREBASE_CONFIG, `add-athlete-${Date.now()}`);
        const cred = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
        await database.ref(`users/${cred.user.uid}`).set({ name, email, type: 'atleta', photoURL, professorUid: window.appState.currentUser.uid, createdAt: new Date().toISOString() });
        await secondaryApp.delete();
        showSuccess(`Atleta ${name} criado!`);
        closeModal('addAthleteModal');
        e.target.reset();
    } catch (error) {
        showError(getErrorMessage(error));
    } finally {
        setButtonLoading(btn, false);
    }
}

async function loadKnowledgeBase(elementId) {
    const ref = database.ref("knowledge");
    ref.on("value", (snapshot) => {
        const items = snapshot.val() || {};
        const listDiv = document.getElementById(elementId);
        if(!listDiv) return;
        listDiv.innerHTML = "";
        if (Object.keys(items).length > 0) {
            Object.keys(items).forEach(key => {
                const item = items[key];
                const card = document.createElement('div');
                card.className = 'knowledge-card';
                card.innerHTML = `<h3>${item.title}</h3><a href="${item.fileURL}" target="_blank" rel="noopener noreferrer" class="btn-secondary"><i class="fas fa-download"></i> Ver ${item.fileName}</a>`;
                listDiv.appendChild(card);
            });
        } else {
            listDiv.innerHTML = `<div class="empty-state"><i class="fas fa-brain"></i><p>Nenhum item de conhecimento.</p></div>`;
        }
    });
}

async function loadAthleteGoals() { 
    const ref = database.ref(`users/${window.appState.currentUser.uid}/goals`);
    ref.on("value", (snapshot) => {
        const goals = snapshot.val();
        const div = document.getElementById("goalsList");
        if (!div) return;
        if (goals) {
            div.innerHTML = `<p><strong>Meta Semanal:</strong> ${goals.weeklyDistance || 'N/A'} km</p><p><strong>Prova Alvo:</strong> ${goals.targetRace || 'N/A'}</p><p><strong>Data:</strong> ${goals.raceDate ? new Date(goals.raceDate).toLocaleDateString() : 'N/A'}</p>`;
        } else {
            div.innerHTML = `<div class="empty-state"><i class="fas fa-bullseye"></i><p>Nenhum objetivo definido.</p></div>`;
        }
    });
}

let currentAthleteUidForGoals = null;
async function handleSetGoals(e) {
    e.preventDefault();
    if (!currentAthleteUidForGoals) return;
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    const goals = {
        weeklyDistance: document.getElementById('weeklyDistance').value,
        targetRace: document.getElementById('targetRace').value,
        raceDate: document.getElementById('raceDate').value
    };
    try {
        await database.ref(`users/${currentAthleteUidForGoals}/goals`).set(goals);
        showSuccess("Objetivos salvos!");
        closeModal('goalsModal');
    } catch (error) {
        showError("Erro ao salvar os objetivos.");
    } finally {
        setButtonLoading(btn, false);
    }
}

function openGoalsModal(uid, name) {
    currentAthleteUidForGoals = uid;
    document.getElementById('goalsAthleteName').textContent = `Metas para ${name}`;
    const form = document.getElementById('goalsForm');
    if(form) form.reset();
    database.ref(`users/${uid}/goals`).once('value').then(snapshot => {
        if(snapshot.exists()) {
            const goals = snapshot.val();
            document.getElementById('weeklyDistance').value = goals.weeklyDistance || '';
            document.getElementById('targetRace').value = goals.targetRace || '';
            document.getElementById('raceDate').value = goals.raceDate || '';
        }
    });
    showModal("goalsModal");
}

function showProfTab(tabName) {
    document.querySelectorAll('#professorDashboard .dash-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('#professorDashboard .dash-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function showDashTab(tabName) {
    document.querySelectorAll('#atletaDashboard .dash-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('#atletaDashboard .dash-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
}
