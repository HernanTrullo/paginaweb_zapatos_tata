// admin.js
import { database, auth } from '../config/firebase-config.js';
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "../login/login.html"; // Redirige si no está autenticado o no es admin
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = "../login/login.html";
  });
});

const form = document.getElementById("zapatoForm");
const catalogoContenedor = document.querySelector(".row.row-cols-1.row-cols-sm-2.row-cols-md-3.g-4");
const modalElement = document.getElementById("formModal");
const modalBootstrap = new bootstrap.Modal(modalElement);
const zapatoIdInput = document.getElementById("zapatoId");
const submitBtn = form.querySelector("button[type='submit']");

// Toast container
const toastContainer = document.createElement('div');
toastContainer.setAttribute('aria-live', 'polite');
toastContainer.setAttribute('aria-atomic', 'true');
toastContainer.style.position = 'fixed';
toastContainer.style.top = '1rem';
toastContainer.style.right = '1rem';
toastContainer.style.zIndex = '1080';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success') {
  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    </div>
  `;
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  const toastEl = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
  bsToast.show();
  // Remove toast from DOM after hidden
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = zapatoIdInput.value;
  const nombre = document.getElementById("nombre").value.trim();
  const marca = document.getElementById("marca").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const imagen = document.getElementById("imagen").value.trim();
  const tallasInput = document.getElementById("tallas").value;
  const stock = document.getElementById("stock").value;

  // Validación básica
  if (!nombre || !marca || isNaN(precio) || precio < 0 || !imagen || !tallasInput || !stock) {
    showToast("Por favor completa todos los campos correctamente.", "danger");
    return;
  }

  // Validar URL de imagen (extensiones comunes)
  const urlRegex = /^https?:\/\/.*\.(jpeg|jpg|png|gif|webp)$/i;
  if (!urlRegex.test(imagen)) {
    showToast("Por favor ingresa una URL de imagen válida (jpeg, jpg, png, gif, webp).", "danger");
    return;
  }

  // Validar tallas (números separados por coma)
  const tallas = tallasInput.split(",").map(t => t.trim()).filter(t => t !== "");
  const tallaValida = tallas.every(t => /^\d+(\.\d+)?$/.test(t));
  if (!tallaValida || tallas.length === 0) {
    showToast("Por favor ingresa tallas válidas, separadas por coma.", "danger");
    return;
  }

  const datosZapato = { nombre, marca, precio, imagen, tallas, stock };

  try {
    submitBtn.disabled = true;

    if (id) {
      // Editar zapato existente
      const zapatoRef = ref(database, `zapatos/${id}`);
      await update(zapatoRef, datosZapato);
      showToast("Zapato actualizado correctamente.");
    } else {
      // Agregar nuevo zapato
      const zapatosRef = ref(database, "zapatos");
      await push(zapatosRef, datosZapato);
      showToast("Zapato agregado correctamente.");
    }

    form.reset();
    zapatoIdInput.value = ""; // Limpiar ID oculto
    modalBootstrap.hide();
  } catch (error) {
    console.error("Error al guardar el zapato:", error);
    showToast("Error al guardar en la base de datos.", "danger");
  } finally {
    submitBtn.disabled = false;
  }
});

function crearCardZapato(zapato, id) {
  const divCol = document.createElement("div");
  divCol.className = "col";

  const tallasHTML = zapato.tallas.map(talla =>
    `<span class="badge bg-secondary">${talla}</span>`).join(" ");

  const stockBadge = zapato.stock === "disponible"
    ? `<span class="badge bg-success">Disponible</span>`
    : `<span class="badge bg-danger">Agotado</span>`;

  divCol.innerHTML = `
    <div class="card h-100 shadow-sm">
      <img src="${zapato.imagen}" class="card-img-top" alt="Imagen de ${zapato.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
      <div class="card-body d-flex flex-column justify-content-between">
        <div>
          <h5 class="card-title">${zapato.nombre}</h5>
          <p class="card-text"><strong>Marca:</strong> ${zapato.marca}</p>
          <p class="card-text"><strong>Precio:</strong> $${zapato.precio.toFixed(2)}</p>
          <p class="card-text"><strong>Estado:</strong> ${stockBadge}</p>
          <p class="card-text"><strong>Tallas disponibles:</strong></p>
          <div class="d-flex flex-wrap gap-2">${tallasHTML}</div>
        </div>
        <div class="d-flex justify-content-end mt-3 gap-2">
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${id}" title="Editar">
                <i class="bi bi-pen"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${id}" title="Eliminar">
                <i class="bi bi-trash"></i>
            </button>
        </div>
      </div>
    </div>
  `;
  return divCol;
}

function cargarZapatos() {
  const zapatosRef = ref(database, "zapatos");
  onValue(zapatosRef, (snapshot) => {
    catalogoContenedor.innerHTML = ""; // Limpiar catálogo

    snapshot.forEach(childSnapshot => {
      const id = childSnapshot.key;
      const zapato = childSnapshot.val();
      const card = crearCardZapato(zapato, id);
      catalogoContenedor.appendChild(card);
    });

    // Eventos para eliminar
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        // Modal Bootstrap para confirmar eliminación
        if (confirm("¿Deseas eliminar este zapato?")) {
          try {
            const zapatoRef = ref(database, `zapatos/${id}`);
            await remove(zapatoRef);
            showToast("Zapato eliminado correctamente.");
          } catch (error) {
            console.error("Error al eliminar el zapato:", error);
            showToast("Error al eliminar el zapato.", "danger");
          }
        }
      });
    });

    // Eventos para editar
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const zapato = snapshot.child(id).val();

        // Cargar datos en el formulario
        document.getElementById("nombre").value = zapato.nombre;
        document.getElementById("marca").value = zapato.marca;
        document.getElementById("precio").value = zapato.precio;
        document.getElementById("imagen").value = zapato.imagen;
        document.getElementById("tallas").value = zapato.tallas.join(", ");
        document.getElementById("stock").value = zapato.stock;
        zapatoIdInput.value = id;

        // Mostrar el modal
        modalBootstrap.show();
      });
    });
  });
}

// Carga inicial
cargarZapatos();
