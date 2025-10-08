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

async function loadAthleteGoals() { /* ...lógica mantida... */ }
let currentAthleteUidForGoals = null;
async function handleSetGoals(e) { /* ...lógica mantida... */ }
function openGoalsModal(uid, name) { /* ...lógica mantida... */ }
function showProfTab(tabName) { /* ...lógica de abas mantida... */ }
function showDashTab(tabName) { /* ...lógica de abas mantida... */ }