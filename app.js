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

  // evito mostrar tarjetas vacías o errores cuando el array usuarios no tiene elementos
  if (usuarios.length === 0) {
    usersContainer.innerHTML =
      '<div class="empty-state">No hay usuarios registrados</div>';
    return;
  }

  // Itera sobre cada elemento del array usuarios
  usuarios.forEach(function (usuario) {
    // Crear la tarjeta principal
    const userCard = document.createElement('div');     // Crea un nuevo elemento <div> en el DOM.
    userCard.classList.add('user-card');

    // ID
    const userId = document.createElement('div');
    userId.classList.add('user-id');
    userId.textContent = 'ID: ' + usuario.id;
    userCard.appendChild(userId);     // appendChild() sirve para insertar elementos HTML en otros elementos, y lo hace al final de los hijos existentes

    // Nombre
    const userName = document.createElement('div');
    userName.classList.add('user-name');        // aplicar estilos al elemento HTML usando clases CSS
    userName.textContent = usuario.nombre;
    userCard.appendChild(userName);

    // Detalles
    const userDetails = document.createElement('div');
    userDetails.classList.add('user-details');

    const userAge = document.createElement('div');
    userAge.textContent = 'Edad: ' + usuario.edad + ' años';
    userDetails.appendChild(userAge);

    const userEmail = document.createElement('div');
    userEmail.textContent = 'Email: ' + usuario.email;
    userDetails.appendChild(userEmail);

    // Agregar detalles a la tarjeta
    userCard.appendChild(userDetails);

    // Agregar la tarjeta al contenedor
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

// Carga el mensaje de bienvenida al iniciar la página.
function loadWelcomeMessage() {
  const savedColor = localStorage.getItem('favoriteColor');
  if (savedColor) {
    welcomeMessage.textContent = `¡Hola! Tu color favorito es: ${savedColor}`; // Si hay un color favorito guardado en localStorage, lo muestra.
  } else {
    welcomeMessage.textContent = '¡Bienvenido! Agrega tu primer usuario';   // Si no hay color guardado, muestra un mensaje genérico.
  }
}

// Actualiza el mensaje de bienvenida si hay un color favorito guardado.
// No hace nada si no hay color en localStorage.
function updateWelcomeMessage() {
  const savedColor = localStorage.getItem('favoriteColor');
  if (savedColor) {
    welcomeMessage.textContent = `¡Hola! Tu color favorito es: ${savedColor}`;
  }
}
