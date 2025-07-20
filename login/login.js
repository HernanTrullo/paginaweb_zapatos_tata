import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from '../config/firebase-config.js';

const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('loginError');

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const iconPassword = document.getElementById("iconPassword");

togglePassword.addEventListener("click", function () {
const type = passwordInput.type === "password" ? "text" : "password";
passwordInput.type = type;

// Cambiar el ícono
iconPassword.classList.toggle("bi-eye");
iconPassword.classList.toggle("bi-eye-slash");
});

form.addEventListener('submit', (e) => {
e.preventDefault();
const email = form.email.value;
const password = form.password.value;

signInWithEmailAndPassword(auth, email, password)
.then(() => {
    window.location.href = "../admin/admin.html";
})
.catch(error => {
    errorDiv.textContent = "Credenciales inválidas";
    errorDiv.style.display = "block";
});
});
