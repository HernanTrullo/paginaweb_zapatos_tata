import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from '../config/firebase-config.js';

const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('loginError');

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
