// Base de datos simulada con estructura JSON  (vector de ejemplo)
let usuarios = [
  { id: 1, nombre: 'Juan', edad: 25, email: 'juan@mail.com' },
  { id: 2, nombre: 'Ana', edad: 30, email: 'ana@mail.com' },
];

// Referencias a elementos del DOM
const formulario = document.getElementById('userForm');
const contenedorUsuarios = document.getElementById('usersContainer');
const mensajeBienvenida = document.getElementById('welcomeMessage');

// carga datos desde localStorage si existen
document.addEventListener('DOMContentLoaded', function () {
  cargarUsuariosDeStorage();
  cargarMensajeBienvenida();
  mostrarUsuarios();
});

// Evento del formulario
formulario.addEventListener('submit', function (event) {
  event.preventDefault(); // evita que el formulario se envíe y recargue la página

  let datosFormulario = new FormData(formulario);

  // Validar datos del formulario antes de procesarlos
  if (!validarDatosFormulario(datosFormulario)) {
    return; // Si la validación falla, no continuar
  }

  let objetoUsuario = convertirFormDataAObjetoUsuario(datosFormulario);
  agregarUsuarioAlArray(objetoUsuario);
  guardarUsuariosEnStorage(); // Guardar array completo en localStorage
  guardarPreferenciaUsuario(datosFormulario.get('favoriteColor'));
  mostrarUsuarios();
  formulario.reset(); // Limpiar el formulario después de enviarlo

  // Mostrar mensaje de éxito
  mostrarMensajeExito('Usuario agregado correctamente');
});

// Funciones de Storage para toda la base de datos
function guardarUsuariosEnStorage() {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function cargarUsuariosDeStorage() {
  const datosGuardados = localStorage.getItem('usuarios');
  if (datosGuardados) {
    usuarios = JSON.parse(datosGuardados); // convierte el string JSON de vuelta a array
  }
}

// Validación del formulario
function validarDatosFormulario(datosFormulario) {
  const nombre = datosFormulario.get('userName').trim(); //.trim() elimina los espacios en blanco al principio y al final de un string.
  const email = datosFormulario.get('userEmail').trim();
  const edad = parseInt(datosFormulario.get('userAge'));

  // Validar que el nombre no esté vacío
  if (nombre === '') {
    mostrarMensajeError('El nombre no puede estar vacío');
    return false;
  }

  // Validar que el email contenga un "@"
  if (!email.includes('@')) {
    mostrarMensajeError('El email debe contener un "@"');
    return false;
  }

  // Validar que la edad sea un número mayor a 0
  if (isNaN(edad) || edad <= 0) {
    // isNan (is Not a Number): Evalúa si el valor NO es un número válido
    mostrarMensajeError('La edad debe ser un número mayor a 0');
    return false;
  }

  return true; // Si todas las validaciones pasan, se llega al final y se devuelve true
}

// Convertir FormData a objeto usuario
function convertirFormDataAObjetoUsuario(datosFormulario) {
  return {
    id: generarNuevoId(),
    nombre: datosFormulario.get('userName').trim(),
    edad: parseInt(datosFormulario.get('userAge')),
    email: datosFormulario.get('userEmail').trim(),
  };
}

// Generar nuevo ID único basado en el ID más alto actual
function generarNuevoId() {
  return usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
}

// Agregar usuario al array
function agregarUsuarioAlArray(objetoUsuario) {
  usuarios.push(objetoUsuario);
}

//Mostrar usuarios desde Storage
function mostrarUsuarios() {
  contenedorUsuarios.innerHTML = '';

  if (usuarios.length === 0) {
    contenedorUsuarios.innerHTML =
      '<div class="empty-state">No hay usuarios registrados</div>';
    return;
  }

  // Itera sobre cada usuario y crea su tarjeta visual
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
    contenedorUsuarios.appendChild(userCard);
  });
}

// Funciones para el color favorito (mantenido de la entrega anterior)
function guardarPreferenciaUsuario(colorFavorito) {
  if (colorFavorito && colorFavorito.trim() !== '') {
    localStorage.setItem('favoriteColor', colorFavorito);
    actualizarMensajeBienvenida();
  }
}

function cargarMensajeBienvenida() {
  const colorGuardado = localStorage.getItem('favoriteColor');
  if (colorGuardado) {
    mensajeBienvenida.textContent = `¡Hola! Tu color favorito es: ${colorGuardado}`;
  } else {
    mensajeBienvenida.textContent = '¡Bienvenido! Agrega tu primer usuario';
  }
}

function actualizarMensajeBienvenida() {
  const colorGuardado = localStorage.getItem('favoriteColor');
  if (colorGuardado) {
    mensajeBienvenida.textContent = `¡Hola! Tu color favorito es: ${colorGuardado}`;
  }
}

// auxiliares para mostrar mensajes (crea mensaje, muestra, lo oculta)
function mostrarMensajeError(mensaje) {
  // Crear elemento de error si no existe
  let divError = document.getElementById('errorMessage');
  if (!divError) {
    // si no existe un mensaje de error en html crea uno
    divError = document.createElement('div'); // crea elemento 'div'
    divError.id = 'errorMessage'; // le asigna un ID
    divError.classList.add('error-message'); // agrego una clase css llamada "error-message"
    formulario.insertBefore(divError, formulario.firstChild); // insertar al inicio del formulario
  }

  // muestra mensaje
  divError.textContent = mensaje;
  divError.style.display = 'block';

  // Ocultar después de 3 segundos automaticamente
  setTimeout(() => {
    divError.style.display = 'none';
  }, 3000);
}

// idem mensaje de exito (crea mensaje / lo muestra / lo oculta)
function mostrarMensajeExito(mensaje) {
  // Crear elemento de éxito si no existe
  let divExito = document.getElementById('successMessage');
  if (!divExito) {
    divExito = document.createElement('div');
    divExito.id = 'successMessage';
    divExito.classList.add('success-message');
    formulario.insertBefore(divExito, formulario.firstChild); // insertar al inicio del formulario
  }

  divExito.textContent = mensaje;
  divExito.style.display = 'block';

  // Ocultar después de 3 segundos automaticamente
  setTimeout(() => {
    divExito.style.display = 'none';
  }, 3000);
}

// FALTA APIIIII
