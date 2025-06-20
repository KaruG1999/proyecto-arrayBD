// Ej Array de usuarios (simulo usuarios ingresados)
let usuarios = [
  { id: 1, nombre: 'Juan', edad: 25, email: 'juan@mail.com' },
  { id: 2, nombre: 'Ana', edad: 30, email: 'ana@mail.com' },
];

// traigo el formulario y lo asigno a una constante para trabajar con el
const form = document.getElementById('userForm');
const usersContainer = document.getElementById('usersContainer');
const welcomeMessage = document.getElementById('welcomeMessage');

// Cuando se envía el formulario, ejecuta la función que sigue
form.addEventListener('submit', function (event) {
  event.preventDefault(); // evita recarga pagina por defecto
  let userFormData = new FormData(form); // contiene todos los datos que el usuario completó
  let userObject = convertFormDataToUserObj(userFormData); // convierte el FormData en un objeto JavaScript
  addUserToArray(userObject); // función que agrega el objeto del usuario a un array
  saveUserPreference(userFormData.get('favoriteColor')); // función que guarda color en local Storage
  displayUsers(); //  muestra en pantalla todos los usuarios que hay en el array
  form.reset(); // Limpia el formulario
});

// Carga contenido al iniciar
document.addEventListener('DOMContentLoaded', function () {
  loadWelcomeMessage();
  displayUsers();
});

// Funciones principales
function convertFormDataToUserObj(userFormData) {
  return {
    id: generateNewId(),
    nombre: userFormData.get('userName'),
    edad: parseInt(userFormData.get('userAge')),
    email: userFormData.get('userEmail'),
  };
}
// genera un nuevo ID numérico para un nuevo usuario
function generateNewId() {
  return usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
}

function addUserToArray(userObject) {
  usuarios.push(userObject);
}

// Mostrar usuarios en pantalla
function displayUsers() {
  usersContainer.innerHTML = '';

  if (usuarios.length === 0) {
    usersContainer.innerHTML =
      '<div class="empty-state">No hay usuarios registrados</div>';
    return;
  }

  usuarios.forEach(function (usuario) {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    userCard.innerHTML = `
                    <div class="user-id">ID: ${usuario.id}</div>
                    <div class="user-name">${usuario.nombre}</div>
                    <div class="user-details">
                        <div>Edad: ${usuario.edad} años</div>
                        <div>Email: ${usuario.email}</div>
                    </div>
                `;
    usersContainer.appendChild(userCard);
  });
}

// Funciones de Storage
function saveUserPreference(favoriteColor) {
  if (favoriteColor && favoriteColor.trim() !== '') {
    localStorage.setItem('favoriteColor', favoriteColor);
    updateWelcomeMessage();
  }
}

function loadWelcomeMessage() {
  const savedColor = localStorage.getItem('favoriteColor');
  if (savedColor) {
    welcomeMessage.textContent = `¡Hola! Tu color favorito es: ${savedColor}`;
  } else {
    welcomeMessage.textContent = '¡Bienvenido! Agrega tu primer usuario';
  }
}

function updateWelcomeMessage() {
  const savedColor = localStorage.getItem('favoriteColor');
  if (savedColor) {
    welcomeMessage.textContent = `¡Hola! Tu color favorito es: ${savedColor}`;
  }
}
