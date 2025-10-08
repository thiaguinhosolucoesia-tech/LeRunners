// Arquivo principal da aplicação - Ponto de entrada e controle de UI

document.addEventListener('DOMContentLoaded', function() {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    database = firebase.database();
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    checkAuthState();
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    await loginUser(email, password);
    setButtonLoading(btn, false);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
}

async function showDashboard(userType) {
    showLoading(true);
    const dashboardId = `${userType}Dashboard`;
    showScreen(dashboardId);
    
    const container = document.getElementById(dashboardId);
    if (container && window.templates[userType]) {
        container.innerHTML = window.templates[userType]();
    }
    document.getElementById('modalsContainer').innerHTML = window.templates.modals();
    
    await new Promise(resolve => setTimeout(resolve, 50)); // Garante a renderização do DOM

    try {
        switch (userType) {
            case 'admin': await loadAdminDashboard(); break;
            case 'professor': await loadProfessorDashboard(); break;
            case 'atleta': await loadAthleteDashboard(); break;
        }
    } catch (error) {
        console.error("Erro fatal ao carregar dashboard:", error);
        logout();
    } finally {
        showLoading(false);
    }
}

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);

    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`, {
        method: 'POST', body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    return data.secure_url;
}

function showLoading(show) { document.getElementById('loadingOverlay').classList.toggle('active', show); }
function setButtonLoading(btn, loading) { if (!btn) return; btn.disabled = loading; const txt = btn.querySelector('.btn-text'); const ldg = btn.querySelector('.btn-loading'); if(txt) txt.style.display = loading ? 'none' : 'inline'; if(ldg) ldg.style.display = loading ? 'inline' : 'none'; }
function showError(msg) { const el = document.getElementById('errorMessage'); if (el) { el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 5000); } }
function showSuccess(msg) { const el = document.createElement('div'); el.className = 'success-message'; el.innerHTML = `<i class="fas fa-check-circle"></i><span>${msg}</span>`; document.body.appendChild(el); setTimeout(() => el.remove(), 3000); }
function showModal(id) { const el = document.getElementById(id); if (el) el.classList.add('active'); }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('active'); }