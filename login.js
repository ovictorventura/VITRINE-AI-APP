// Importa as funções de autenticação do Firebase
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// Pega a instância de autenticação
const auth = getAuth();

// Pega os elementos do HTML
const emailInput = document.getElementById("email-login");
const passwordInput = document.getElementById("password-login");
const loginButton = document.getElementById("btn-login");

// Verifica se o usuário já está logado e o redireciona
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Substitua "app.html" pelo nome do seu arquivo principal
    window.location.href = "app.html"; 
  }
});

// Adiciona um evento de clique ao botão de login
loginButton.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Se o login for bem-sucedido, o onAuthStateChanged acima já vai redirecionar
            console.log("Login realizado com sucesso!");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/wrong-password') {
                alert("Senha incorreta.");
            } else if (errorCode === 'auth/user-not-found') {
                alert("E-mail não encontrado.");
            } else {
                alert("Erro ao fazer login: " + errorMessage);
            }
        });
});
