{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ getAuth, signInWithEmailAndPassword, onAuthStateChanged \} from "firebase/auth";\
import \{ initializeApp \} from "firebase/app";\
\
// Reutilize sua configura\'e7\'e3o do firebase.js se ela estiver no mesmo arquivo ou ajuste os imports.\
// O ideal \'e9 que essa inicializa\'e7\'e3o esteja apenas em firebase.js e voc\'ea apenas importe 'getAuth' aqui.\
// Se voc\'ea seguiu o passo a passo, o c\'f3digo abaixo j\'e1 deve funcionar.\
\
const auth = getAuth();\
\
// Redireciona se o usu\'e1rio j\'e1 estiver logado\
onAuthStateChanged(auth, (user) => \{\
  if (user) \{\
    // Usu\'e1rio logado, redirecionar para a p\'e1gina principal\
    window.location.href = "app.html"; // Mude para o nome do seu arquivo principal\
  \}\
\});\
\
// Pega os elementos da p\'e1gina de login\
const emailInput = document.getElementById("email-login");\
const passwordInput = document.getElementById("password-login");\
const loginButton = document.getElementById("btn-login");\
\
loginButton.addEventListener("click", () => \{\
    const email = emailInput.value;\
    const password = passwordInput.value;\
\
    signInWithEmailAndPassword(auth, email, password)\
        .then((userCredential) => \{\
            // Login bem-sucedido\
            console.log("Login feito com sucesso!");\
            // O onAuthStateChanged acima j\'e1 vai cuidar do redirecionamento\
        \})\
        .catch((error) => \{\
            // Erro no login\
            const errorCode = error.code;\
            const errorMessage = error.message;\
\
            if (errorCode === 'auth/wrong-password') \{\
                alert("Senha incorreta.");\
            \} else if (errorCode === 'auth/user-not-found') \{\
                alert("Usu\'e1rio n\'e3o encontrado.");\
            \} else \{\
                alert("Erro ao fazer login: " + errorMessage);\
            \}\
        \});\
\});}