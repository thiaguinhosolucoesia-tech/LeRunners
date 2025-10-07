// Configuração do Firebase com os valores reais do projeto LeRunners
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAvNlifcwHV6qPh9cKCJTQoJM2bMkGl2HQ",
    authDomain: "lerunners-4725f.firebaseapp.com",
    databaseURL: "https://lerunners-4725f-default-rtdb.firebaseio.com",
    projectId: "lerunners-4725f",
    storageBucket: "lerunners-4725f.firebasestorage.app",
    messagingSenderId: "490740324975",
    appId: "1:490740324975:web:c354dcdcd334c049a58b9a"
};

// Configuração do Cloudinary com os valores reais do projeto
const CLOUDINARY_CONFIG = {
    CLOUD_NAME: "dd6ppm6nf",
    API_KEY: "845911223412467",
    API_SECRET: "S6YefZx7J5StgcTV-greU4wFhP4"
};

// Configuração do Strava para integração OAuth 2.0
const STRAVA_CONFIG = {
    clientId: "180023", 
    clientSecret: "b9e9c18254fe229af3a7e95a995c0c94b22d41ff", // ATENÇÃO: Mover para backend em produção
    redirectUri: window.location.origin + '/dashboard.html',
    scope: 'read,activity:read_all,profile:read_all',
    authUrl: 'https://www.strava.com/oauth/authorize',
    tokenUrl: 'https://www.strava.com/oauth/token',
    apiUrl: 'https://www.strava.com/api/v3'
};

// Configurações gerais da aplicação
const APP_CONFIG = {
    name: 'LeRunners',
    version: '2.0.0',
    environment: 'production',
    features: {
        stravaIntegration: true,
        smartSuggestions: true,
        performanceCharts: true,
        socialFeatures: true
    },
    limits: {
        maxActivitiesPerSync: 10,
        syncIntervalMinutes: 30,
        maxCommentLength: 500
    }
};

// Inicializar Firebase (versão 8)
if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
}

// Referência global APENAS para o Realtime Database
const database = firebase.database();

// Funções utilitárias para configuração
const ConfigUtils = {
    // Verificar se a integração Strava está habilitada
    isStravaEnabled: () => APP_CONFIG.features.stravaIntegration,
    
    // Obter URL completa de redirecionamento do Strava
    getStravaRedirectUri: () => STRAVA_CONFIG.redirectUri,
    
    // Obter URL de autorização do Strava com parâmetros
    getStravaAuthUrl: (state = null) => {
        const params = new URLSearchParams({
            client_id: STRAVA_CONFIG.clientId,
            redirect_uri: STRAVA_CONFIG.redirectUri,
            response_type: 'code',
            scope: STRAVA_CONFIG.scope,
            approval_prompt: 'auto'
        });
        
        if (state) {
            params.append('state', state);
        }
        
        return `${STRAVA_CONFIG.authUrl}?${params.toString()}`;
    },
    
    // Validar configurações na inicialização
    validateConfig: () => {
        const errors = [];
        
        if (!FIREBASE_CONFIG.apiKey) {
            errors.push('Firebase API Key não configurada');
        }
        
        if (!STRAVA_CONFIG.clientId) {
            errors.push('Strava Client ID não configurado');
        }
        
        if (errors.length > 0) {
            console.error('Erros de configuração:', errors);
            return false;
        }
        
        return true;
    }
};

// Validar configurações na inicialização
if (ConfigUtils.validateConfig()) {
    console.log('✅ Firebase v8 SDK, Cloudinary e Strava configurados com sucesso.');
    console.log(`📱 Aplicação: ${APP_CONFIG.name} v${APP_CONFIG.version}`);
    console.log(`🔗 Integração Strava: ${ConfigUtils.isStravaEnabled() ? 'Habilitada' : 'Desabilitada'}`);
} else {
    console.error('❌ Falha na configuração da aplicação. Verifique as credenciais.');
}

