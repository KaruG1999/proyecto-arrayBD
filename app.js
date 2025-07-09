// Base de datos simulada con estructura JSON (vector de ejemplo)
let usuarios = [
  { id: 1, nombre: 'Juan', edad: 25, email: 'juandonado@hotmail.com' },
  { id: 2, nombre: 'Ana', edad: 30, email: 'luicarrizo@gmail.com' },
];

// Referencias a elementos del DOM
const formulario = document.getElementById('userForm');
const contenedorUsuarios = document.getElementById('usersContainer');
const mensajeBienvenida = document.getElementById('welcomeMessage');

// Carga datos desde localStorage si existen
document.addEventListener('DOMContentLoaded', function () {
  cargarUsuariosDeStorage();
  cargarMensajeBienvenida();
  mostrarUsuarios();
  agregarBotonValidarEmails();
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
  guardarPreferenciaUsuario(datosFormulario.get('favoriteColor')); // podría omitirse
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
    // isNaN (is Not a Number): Evalúa si el valor NO es un número válido
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
    emailValido: null, // Se llenará con la validación de API
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

// Función para reordenar IDs después de eliminar un usuario
function reordenarIds() {
  usuarios.forEach((usuario, indice) => {
    usuario.id = indice + 1; // Reasignar ID secuencial empezando desde 1
  });
}

// Función para eliminar usuario del array y localStorage
function eliminarUsuario(idUsuario) {
  // Buscar el índice del usuario con el ID específico
  const indiceUsuario = usuarios.findIndex(
    (usuario) => usuario.id === idUsuario
  );

  if (indiceUsuario !== -1) {
    // Eliminar el usuario del array
    usuarios.splice(indiceUsuario, 1);

    // Reordenar los IDs para mantener secuencia continua  (sino al eliminar un usuario, los IDs quedarían desordenados)
    reordenarIds();

    // Guardar los cambios en localStorage
    guardarUsuariosEnStorage();

    // Actualizar la vista
    mostrarUsuarios();

    // Mostrar mensaje de éxito
    mostrarMensajeExito('Usuario eliminado correctamente');
  } else {
    // Mostrar mensaje de error si no se encuentra el usuario
    mostrarMensajeError('Usuario no encontrado');
  }
}

// Mostrar usuarios desde Storage
function mostrarUsuarios() {
  contenedorUsuarios.innerHTML = '';

  // Si no hay usuarios, mostrar mensaje de estado vacío
  if (usuarios.length === 0) {
    contenedorUsuarios.innerHTML =
      '<div class="empty-state">No hay usuarios registrados</div>';
    return;
  }

  // sino Itera sobre cada usuario y crea su tarjeta visual
  usuarios.forEach(function (usuario) {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';

    // contenido base de la tarjeta (agrega contenido HTML a la tarjeta)
    let cardContent = `              
      <div class="user-id">ID: ${usuario.id}</div>
      <div class="user-name">${usuario.nombre}</div>
      <div class="user-details">
        <div>Edad: ${usuario.edad} años</div>
        <div>Email: ${usuario.email}</div>
      </div>
    `;

    // Agregar información adicional de la API si existe
    if (usuario.emailValido !== null) {
      const estadoEmail = usuario.emailValido
        ? '<span style="color: #90ee90;">✓ Email válido</span>' // span: contenedor para aplicar estilos
        : '<span style="color: red;">✗ Email inválido</span>';

      let razonTexto = '';
      if (usuario.razonValidacion) {
        razonTexto = `<small style="color: #666;"> (${usuario.razonValidacion})</small>`; // small: texto secundario
      }

      cardContent += `<div class="email-status">${estadoEmail}${razonTexto}</div>`;
    }

    // Agregar botón de eliminar
    cardContent += `<button class="btn-delete" onclick="eliminarUsuario(${usuario.id})" style="background-color: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Eliminar</button>`;

    userCard.innerHTML = cardContent; // Asignar contenido HTML a la tarjeta
    contenedorUsuarios.appendChild(userCard); // Agregar la tarjeta al contenedor de usuarios
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

// Auxiliares para mostrar mensajes (crea mensaje, muestra, lo oculta)
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

// Idem mensaje de éxito (crea mensaje / lo muestra / lo oculta)
function mostrarMensajeExito(mensaje) {
  // Crear elemento de éxito si no existe
  let divExito = document.getElementById('successMessage');
  if (!divExito) {
    divExito = document.createElement('div');
    divExito.id = 'successMessage';
    divExito.class = 'success-message';
    formulario.insertBefore(divExito, formulario.firstChild); // insertar al inicio del formulario
  }

  divExito.textContent = mensaje;
  divExito.style.display = 'block';

  // Ocultar después de 3 segundos automaticamente
  setTimeout(() => {
    divExito.style.display = 'none';
  }, 3000);
}

// ============== INTEGRACIÓN CON API ==============

// Función para validar email usando AbstractAPI
function validarEmailConAPI(email) {
  // API Key de AbstractAPI
  const API_KEY = 'cca5c0e3a5bc478e8da41203f1e75fb';
  const API_URL = `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${email}`;

  return fetch(API_URL) // Realiza la petición a la API
    .then((response) => {
      // Maneja la respuesta de la API
      // Verifica si la respuesta es exitosa (código 200-299)
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      return response.json(); // Convierte la respuesta a JSON
    })
    .then((data) => {
      // Procesa los datos recibidos
      // Criterios más flexibles para validación - solo rechazar si hay problemas críticos (sino rechaza muchos mails válidos)
      const formatoValido = data.is_valid_format;
      const noEsUndeliverable = data.deliverability !== 'UNDELIVERABLE'; // No debe ser "UNDELIVERABLE" porque eso indica que no se puede entregar

      // Ser más permisivo con emails - solo rechazar si hay problemas graves
      const esValido =
        formatoValido &&
        (noEsUndeliverable || data.deliverability === 'UNKNOWN'); // Aceptar "UNKNOWN" como válido

      return {
        // Retorna un objeto con el resultado de la validación
        esValido: esValido,
        informacion: data,
        razon: getValidationReason(data),
      };
    })
    .catch((error) => {
      // Maneja errores de la petición
      console.error('Error validando email:', error);
      return {
        esValido: null,
        informacion: null,
        razon: 'Error de conexión con API',
      };
    });
}

// Función para obtener razón de validación
function getValidationReason(data) {
  // accedo a los datos de validación y retorno un mensaje descriptivo
  // propiedades de la API, se accede con => data.propiedad
  if (!data.is_valid_format) {
    return 'Formato inválido';
  }
  // deliverability indica si el email es entregable o no
  if (data.deliverability === 'UNDELIVERABLE') {
    // si es "UNDELIVERABLE" no se puede entregar
    return 'Email no entregable';
  }
  if (data.deliverability === 'DELIVERABLE') {
    // si es "DELIVERABLE" se puede entregar
    return 'Email válido y entregable';
  }
  if (data.deliverability === 'UNKNOWN') {
    // si es "UNKNOWN" no se sabe si es entregable o no
    return 'Email válido (estado incierto)';
  }
  if (data.is_disposable_email) {
    // si es "disposable" es un email temporal
    return 'Email válido (posible temporal)';
  }
  return 'Email válido';
}

// Función para agregar botón de validación de emails
function agregarBotonValidarEmails() {
  // Crear botón (no existe en html)
  if (!document.getElementById('validateEmailsBtn')) {
    const botonValidar = document.createElement('button');
    botonValidar.id = 'validateEmailsBtn';
    botonValidar.textContent = 'Validar Emails con API';
    botonValidar.className = 'btn-validate';
    botonValidar.type = 'button';

    // Agregar evento click
    botonValidar.addEventListener('click', validarTodosLosEmails);

    // Insertar después del formulario
    formulario.parentNode.insertBefore(botonValidar, formulario.nextSibling); // nextSibling: siguiente elemento hermano del formulario
  }
}

// Función para validar todos los emails usando la API
function validarTodosLosEmails() {
  if (usuarios.length === 0) {
    mostrarMensajeError('No hay usuarios para validar');
    return;
  }

  mostrarMensajeExito('Validando emails con API...');

  // Procesar cada usuario
  usuarios.forEach((usuario, indice) => {
    // Validar email si no se ha validado antes
    if (usuario.emailValido === null || usuario.emailValido === undefined) {
      // setTimeout para esperar 1 segundo por cada usuario (sino se saturaría la API)
      setTimeout(() => {
        validarEmailConAPI(usuario.email).then((resultado) => {
          // Llama a la función de validación
          // Actualizar el usuario con el resultado de la validación
          usuario.emailValido = resultado.esValido;
          usuario.razonValidacion = resultado.razon;

          // Guardar cambios en localStorage
          guardarUsuariosEnStorage();

          // Actualizar vista si es el último usuario
          if (indice === usuarios.length - 1) {
            mostrarUsuarios();
            mostrarMensajeExito('Validación completada');
          }
        });
      }, indice * 1000); // Esperar 1 segundo entre cada validación
    }
  });
}
