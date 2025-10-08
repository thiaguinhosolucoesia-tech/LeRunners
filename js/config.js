const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAvNlifcwHV6qPh9cKCJTQoJM2bMkGl2HQ",
    authDomain: "lerunners-4725f.firebaseapp.com",
    databaseURL: "https://lerunners-4725f-default-rtdb.firebaseio.com",
    projectId: "lerunners-4725f",
    appId: "1:490740324975:web:c354dcdcd334c049a58b9a"
};

const STRAVA_CONFIG = {
    clientId: "180023",
    clientSecret: "b9e9c18254fe229af3a7e95a995c0c94b22d41ff",
    redirectUri: window.location.origin + window.location.pathname,
    scope: 'read,activity:read_all,profile:read_all'
};

// ** PREENCHA COM OS SEUS DADOS DO CLOUDINARY **
const CLOUDINARY_CONFIG = {
    cloudName: "dpaayfwlj",      // Insira seu Cloud Name aqui
    apiKey: "958375234747598",   // Insira sua API Key aqui
    uploadPreset: "LeRunners"    // Insira o nome do seu Upload Preset aqui
};

const MASTER_ADMIN_CREDENTIALS = {
    email: "thi@g.com",
    password: "194000"
};

let auth;
let database;

window.appState = {
    currentUser: null,
    userType: null,
};