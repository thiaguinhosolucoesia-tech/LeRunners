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
            window.appState.currentUser = { uid: "master_admin", email, name: "Administrador Mestre", type: "admin" };
            window.appState.userType = "admin";
            await showDashboard("admin");
            return;
        }
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        showError(getErrorMessage(error));
    }
}

async function logout() {
    await auth.signOut();
    window.location.reload();
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
