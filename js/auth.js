function checkAuthState() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
            if (userSnapshot.exists()) {
                window.appState.currentUser = { ...userSnapshot.val(), uid: user.uid, email: user.email };
                window.appState.userType = window.appState.currentUser.type;
                await showDashboard(window.appState.userType);
            } else {
                logout();
            }
        } else {
            showScreen('loginScreen');
        }
    });
}

async function loginUser(email, password) {
    try {
        if (email === MASTER_ADMIN_CREDENTIALS.email && password === MASTER_ADMIN_CREDENTIALS.password) {
            // Define o usuário admin no estado global
            window.appState.currentUser = { 
                uid: "master_admin", 
                email: email, 
                name: "Administrador Mestre", 
                type: "admin" 
            };
            window.appState.userType = "admin";
            // Chama a função para montar o dashboard de admin
            await showDashboard("admin");
            return;
        }
        // Para outros usuários, tenta o login normal. O onAuthStateChanged vai lidar com o resto.
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        showError(getErrorMessage(error));
    }
}

async function logout() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
    } finally {
        // Garante que o estado seja limpo e a página recarregada em qualquer cenário
        window.appState.currentUser = null;
        window.appState.userType = null;
        window.location.reload();
    }
}

function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
             return 'Email ou senha incorretos.';
        case 'auth/email-already-in-use':
            return 'Este email já está em uso.';
        default:
            return 'Ocorreu um erro desconhecido.';
    }
}
