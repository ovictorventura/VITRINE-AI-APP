import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Reutilize sua configuração do firebase.js se ela estiver no mesmo arquivo ou ajuste os imports.
// O ideal é que essa inicialização esteja apenas em firebase.js e você apenas importe 'getAuth' aqui.
// Se você seguiu o passo a passo, o código abaixo já deve funcionar.

const auth = getAuth();

// Redireciona se o usuário já estiver logado
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário logado, redirecionar para a página principal
    window.location.href = "app.html"; // Mude para o nome do seu arquivo principal
  }
});

// Pega os elementos da página de login
const emailInput = document.getElementById("email-login");
const passwordInput = document.getElementById("password-login");
const loginButton = document.getElementById("btn-login");

loginButton.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login bem-sucedido
            console.log("Login feito com sucesso!");
            // O onAuthStateChanged acima já vai cuidar do redirecionamento
        })
        .catch((error) => {
            // Erro no login
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/wrong-password') {
                alert("Senha incorreta.");
            } else if (errorCode === 'auth/user-not-found') {
                alert("Usuário não encontrado.");
            } else {
                alert("Erro ao fazer login: " + errorMessage);
            }
        });
});
