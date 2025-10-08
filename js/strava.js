// ** FUNÇÕES DE INTEGRAÇÃO COM A API DO STRAVA **

function getStravaAuthUrl() {
    const params = new URLSearchParams({
        client_id: STRAVA_CONFIG.clientId,
        redirect_uri: STRAVA_CONFIG.redirectUri,
        response_type: 'code',
        scope: STRAVA_CONFIG.scope,
        approval_prompt: 'force'
    });
    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

function connectStrava() {
    window.location.href = getStravaAuthUrl();
}

async function checkForStravaCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        showLoading(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        await handleStravaCallback(code);
        showLoading(false);
    }
}

async function handleStravaCallback(code) {
    try {
        const response = await fetch(`https://www.strava.com/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: STRAVA_CONFIG.clientId,
                client_secret: STRAVA_CONFIG.clientSecret,
                code: code,
                grant_type: 'authorization_code'
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        const stravaInfo = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
            athleteId: data.athlete.id,
            athleteName: `${data.athlete.firstname} ${data.athlete.lastname}`
        };

        await database.ref(`users/${window.appState.currentUser.uid}/strava`).set(stravaInfo);
        showSuccess('Conta Strava conectada!');
        checkStravaConnection(); // Re-checa para atualizar a UI
    } catch (error) {
        showError('Erro ao conectar com Strava: ' + error.message);
    }
}

async function checkStravaConnection() {
    if(window.appState.userType !== 'atleta') return;

    const snapshot = await database.ref(`users/${window.appState.currentUser.uid}/strava`).once('value');
    const stravaData = snapshot.exists() ? snapshot.val() : null;
    window.appState.stravaData = stravaData;
    
    updateStravaUICard(stravaData);
    await checkForStravaCode();
}

function updateStravaUICard(stravaData) {
    const cardDiv = document.getElementById('stravaCard');
    if (!cardDiv) return;

    if (stravaData) {
        cardDiv.innerHTML = `
            <div class="strava-connected">
                <i class="fab fa-strava fa-3x"></i>
                <h3>Conectado ao Strava</h3>
                <p>Conectado como <strong>${stravaData.athleteName}</strong>.</p>
            </div>
        `;
    } else {
        cardDiv.innerHTML = `
            <div class="strava-disconnected">
                <i class="fab fa-strava fa-3x"></i>
                <h3>Conectar com Strava</h3>
                <p>Importe suas atividades automaticamente.</p>
                <button id="connectStravaBtn" class="btn-strava"><i class="fab fa-strava"></i> Conectar com Strava</button>
            </div>
        `;
    }
}
