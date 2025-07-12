// Base de datos simulada con estructura JSON (vector de ejemplo)
let usuarios = [
  { id: 1, nombre: 'Juan', edad: 25, email: 'juandonado@hotmail.com' },
  { id: 2, nombre: 'Ana', edad: 30, email: 'luicarrizo@gmail.com' },
];

// Referencias a elementos del DOM
const formulario = document.getElementById('userForm');
const contenedorUsuarios = document.getElementById('usersContainer');
const mensajeBienvenida = document.getElementById('welcomeMessage');

// Variable para controlar el estado de validación
let validandoEmails = false;

// Carga datos desde localStorage si existen
document.addEventListener('DOMContentLoaded', function () {
  cargarUsuariosDeStorage();
  cargarMensajeBienvenida();
  mostrarUsuarios();
});

// Evento del formulario
formulario.addEventListener('submit', function (event) {
  event.preventDefault(); // evita que el formulario se envíe y recargue la página

  let datosFormulario = new FormData(formulario); // FormData: permite recoger los datos del formulario de manera sencilla

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
  return usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1; // u : representa cada usuario en el array
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
  // Confirmar eliminación con el usuario
  const confirmacion = window.confirm(
    '¿Estás seguro de que querés eliminar este usuario?'
  );

  if (!confirmacion) {
    return; // Si el usuario cancela, no se hace nada
  }

  // Buscar el índice del usuario con el ID específico
  const indiceUsuario = usuarios.findIndex(
    (usuario) => usuario.id === idUsuario
  ); // findIndex: devuelve el índice usuario buscado o -1 si no se encuentra

  if (indiceUsuario !== -1) {
    usuarios.splice(indiceUsuario, 1); // splice: elimina elementos del array a partir del índice encontrado

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
  contenedorUsuarios.innerHTML = ''; // innerHTML: permite modificar el contenido HTML de un elemento

  // Si no hay usuarios, mostrar mensaje de estado vacío
  if (usuarios.length === 0) {
    contenedorUsuarios.innerHTML =
      '<div class="empty-state">No hay usuarios registrados</div>';
    return;
  }

  // sino Itera sobre cada usuario y crea su tarjeta visual
  usuarios.forEach(function (usuario) {
    const userCard = document.createElement('div'); // createElement: crea un nueva card de usuario
    userCard.className = 'user-card'; // className: asigna una clase CSS a la tarjeta

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
        ? '<span style="color: #85da85ff;">✓ Email válido</span>' // span: contenedor para aplicar estilos
        : '<span style="color: #e53042ff;">✗ Email inválido</span>';

      let razonTexto = '';
      if (usuario.razonValidacion) {
        razonTexto = `<small style="color: #1f1e1eff;"> (${usuario.razonValidacion})</small>`; // small: texto secundario
      } // razonValidacion: contiene la razón de la validación del email

      cardContent += `<div class="email-status">${estadoEmail}${razonTexto}</div>`;
    }

    // botón de validar email individual
    const botonValidarTexto =
      usuario.emailValido === null ? 'Validar Email' : 'Revalidar Email';
    const botonValidarId = `validate-${usuario.id}`;
    cardContent += `<button id="${botonValidarId}" class="btn-validate" onclick="validarEmailIndividual(${usuario.id})">${botonValidarTexto}</button>`;

    // Agregar botón de eliminar
    cardContent += `<button class="btn-delete" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>`;

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

// Función para convertir nombres de colores a valores CSS válidos
function convertirColorAValido(colorInput) {
  const coloresValidos = {
    rojo: '#FF0000',
    azul: '#0000FF',
    verde: '#008000',
    amarillo: '#FFFF00',
    naranja: '#FFA500',
    violeta: '#8A2BE2',
    rosa: '#FFC0CB',
    negro: '#000000',
    blanco: '#FFFFFF',
    gris: '#808080',
    morado: '#800080',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    lima: '#00FF00',
    marrón: '#A52A2A',
    celeste: '#87CEEB',
  };

  const colorLower = colorInput.toLowerCase().trim();

  // Si es un color nombrado, convertir a hex
  if (coloresValidos[colorLower]) {
    return coloresValidos[colorLower];
  }

  // Si ya es un color hex válido, devolverlo
  if (/^#[0-9A-F]{6}$/i.test(colorInput)) {
    return colorInput;
  }

  // Si es un color CSS válido (rgb, rgba, etc.), devolverlo
  if (colorInput.startsWith('rgb') || colorInput.startsWith('hsl')) {
    return colorInput;
  }

  // Si no es válido, devolver un color por defecto
  return '#333333';
}

// Función mejorada para cargar mensaje de bienvenida con color visual
function cargarMensajeBienvenida() {
  const colorGuardado = localStorage.getItem('favoriteColor');
  if (colorGuardado) {
    const colorValido = convertirColorAValido(colorGuardado);   // Convertir el color a un valor CSS válido
    mensajeBienvenida.textContent = `¡Hola! Tu color favorito es: ${colorGuardado}`;

    // Aplico el color visualmente desde js (sugerencia del feedback)
    mensajeBienvenida.style.color = colorValido;
    mensajeBienvenida.style.fontWeight = 'bold'; // Negrita para destacar el mensaje
    
  } else {
    mensajeBienvenida.textContent = '¡Bienvenido! Agrega tu primer usuario';
    // Resetear estilos si no hay color guardado
    mensajeBienvenida.style.color = '';
    mensajeBienvenida.style.fontWeight = '';
  }
}

// Función mejorada para actualizar mensaje de bienvenida
function actualizarMensajeBienvenida() {
  const colorGuardado = localStorage.getItem('favoriteColor');
  if (colorGuardado) {
    const colorValido = convertirColorAValido(colorGuardado);
    mensajeBienvenida.textContent = `¡Hola! Tu color favorito es: ${colorGuardado}`;

    // Aplicar el color visualmente
    mensajeBienvenida.style.color = colorValido;
    mensajeBienvenida.style.fontWeight = 'bold';
    mensajeBienvenida.style.border = `2px solid ${colorValido}`;
    mensajeBienvenida.style.borderRadius = '5px';
    mensajeBienvenida.style.padding = '10px';
    mensajeBienvenida.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
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

// ============== Intento de INTEGRACIÓN CON API ==============

// Función para validar email localmente (sin API) ya que API no funciona como espero
function validarEmailLocal(email) {
  // Regex más completa para validar emails
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Lista de dominios comunes válidos
  const dominiosValidos = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'yahoo.es',
    'icloud.com',
    'live.com',
    'msn.com',
    'protonmail.com',
    'tutanota.com',
  ];

  const formatoValido = regexEmail.test(email); // test: evalúa si el email cumple con el patrón de la expresión regular

  if (!formatoValido) {
    return {
      esValido: false,
      razon: 'Formato de email inválido',
    };
  }

  const dominio = email.split('@')[1]?.toLowerCase(); // split : divide el string en dos partes, antes y después del '@'
  const dominioConocido = dominiosValidos.includes(dominio); // includes: verifica si el dominio está en la lista de dominios válidos

  return {
    esValido: true,
    razon: dominioConocido
      ? 'Email válido (dominio conocido)'
      : 'Email válido (formato correcto)',
  };
}

// Función para obtener razón de validación recibida por la API
// analiza los datos de la API y devuelve un mensaje descriptivo
function getValidationReason(data) {
  console.log('Analizando razón de validación:', data);   // me ayudó a ver resultados en consola

  // Verificar formato
  if (!data.is_valid_format) {   // is_valid_format: propiedad que depende de la respuesta de la API que estás usando
    return 'Formato de email inválido';
  }

  // PROBLEMA: La api responde pero nunca verifica correctamente la validez del email

  // Verificar deliverability : entregabilidad del email
  switch (data.deliverability) {
    case 'DELIVERABLE':
      return 'Email válido y entregable';
    case 'UNDELIVERABLE':
      return 'Email no se puede entregar';
    case 'UNKNOWN':
      return 'Email con formato válido (entregabilidad desconocida)';
    default:
      return 'Estado de email desconocido';
  }
}

// Función COMPLETA para validar email individual
function validarEmailIndividual(idUsuario) {
  // Buscar el usuario
  const usuario = usuarios.find((u) => u.id === idUsuario); // find: busca un usuario por su ID 
  if (!usuario) {
    mostrarMensajeError('Usuario no encontrado');
    return;
  }

  // Obtener el botón específico
  const boton = document.getElementById(`validate-${idUsuario}`);
  if (!boton) {
    mostrarMensajeError('Botón no encontrado');
    return;
  }

  if (boton.disabled) {  // Si el botón ya está deshabilitado, significa que ya se está validando
    return;             // Ya está en proceso
  }

  // Deshabilitar el botón y cambiar texto
  boton.disabled = true;
  boton.textContent = 'Validando...';
  boton.style.backgroundColor = '#cbd0d5ff'; // Color gris para indicar que está deshabilitado

  // LLAMADA A LA API
  validarEmailConAPI(usuario.email)
    .then((resultado) => {
      console.log('Resultado de validación:', resultado);

      // Actualizar el usuario con el resultado
      usuario.emailValido = resultado.esValido;
      usuario.razonValidacion = resultado.razon;

      // Guardar en localStorage
      guardarUsuariosEnStorage();

      // Actualizar la vista
      mostrarUsuarios();

      // Mostrar mensaje según el resultado
      if (resultado.esValido === true) {
        mostrarMensajeExito(
          `Email de ${usuario.nombre} validado correctamente`
        );
      } else if (resultado.esValido === false) {
        mostrarMensajeError(
          `Email de ${usuario.nombre} es inválido: ${resultado.razon}`
        );
      } else {
        mostrarMensajeError(
          `Error validando email de ${usuario.nombre}: ${resultado.razon}`
        );
      }
    })
    .catch((error) => {
      console.error('Error en validación:', error);
      mostrarMensajeError(`Error validando email de ${usuario.nombre}`);

      // Rehabilitar el botón en caso de error
      boton.disabled = false;
      boton.textContent =
        usuario.emailValido === null ? 'Validar Email' : 'Revalidar Email';
    });
}

// Función para validar email usando AbstractAPI con allorigins (problemas de CORS)
// valida email con timeout porque tarda demasiado en responder
function validarEmailConAPI(email) {
  const API_KEY = 'cca5c0e3a5bc478e8da41203f61e75fb';
  const API_URL = `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(
    email
  )}`;
  const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(
    API_URL
  )}`;

  console.log('Validando email:', email);
  console.log('URL con proxy:', PROXY_URL);

  // promesa que rechaza automáticamente después de 15 segundos si no se recibió respuesta de la API. 
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error('Timeout: La API tardó demasiado en responder')),
      15000
    );
  });

  const fetchPromise = fetch(PROXY_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
    .then((response) => {
      console.log('Response status:', response.status);
      // Si la respuesta no tiene estado 200-299 (response.ok), lanza un error.
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((proxyData) => {
      const data = JSON.parse(proxyData.contents);  // proxy data contiene la respuesta de la API y los transforma a JSON string
      console.log('Datos recibidos de la API:', data);

      if (data.error) {
        throw new Error(data.error.message || 'Error en la API');
      }

      const formatoValido = data.is_valid_format === true;
      const esEntregable = data.deliverability === 'DELIVERABLE';
      const esDesconocido = data.deliverability === 'UNKNOWN';

      const esValido = formatoValido && (esEntregable || esDesconocido);

      return {
        esValido: esValido,
        informacion: data,
        razon: getValidationReason(data),
      };
    });

  // Usar Promise.race para aplicar timeout
  return Promise.race([fetchPromise, timeoutPromise]).catch((error) => {
    console.error('Error completo validando email:', error);
    return {     // Si algo falla en todo el proceso, captura el error y devuelve un objeto con información.
      esValido: null,
      informacion: null,
      razon: error.message || 'Error de conexión con API',
    };
  });
}
