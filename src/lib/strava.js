// Configuração do Strava API com os valores reais fornecidos
export const STRAVA_CONFIG = {
  clientId: "180023",
  clientSecret: "b9e9c18254fe229af3a7e95a995c0c94b22d41ff", // Em produção, mover para backend
  redirectUri: window.location.origin + '/dashboard',
  scope: 'read,activity:read_all,profile:read_all',
  authUrl: 'https://www.strava.com/oauth/authorize',
  tokenUrl: 'https://www.strava.com/oauth/token',
  apiUrl: 'https://www.strava.com/api/v3'
};

// Função para gerar URL de autorização do Strava
export const getStravaAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: STRAVA_CONFIG.clientId,
    redirect_uri: STRAVA_CONFIG.redirectUri,
    response_type: 'code',
    scope: STRAVA_CONFIG.scope,
    approval_prompt: 'auto'
  });
  
  return `${STRAVA_CONFIG.authUrl}?${params.toString()}`;
};

// Função para trocar código por token de acesso
export const exchangeCodeForToken = async (code) => {
  try {
    const response = await fetch(STRAVA_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CONFIG.clientId,
        client_secret: STRAVA_CONFIG.clientSecret,
        code: code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao trocar código por token');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na troca de código por token:', error);
    throw error;
  }
};

// Função para buscar atividades do atleta
export const getAthleteActivities = async (accessToken, page = 1, perPage = 30) => {
  try {
    const response = await fetch(
      `${STRAVA_CONFIG.apiUrl}/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar atividades');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    throw error;
  }
};

// Função para buscar dados do atleta
export const getAthleteData = async (accessToken) => {
  try {
    const response = await fetch(`${STRAVA_CONFIG.apiUrl}/athlete`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do atleta');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar dados do atleta:', error);
    throw error;
  }
};
