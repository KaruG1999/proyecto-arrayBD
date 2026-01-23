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

    // botón de validar email individual
    const botonValidarTexto = usuario.emailValido === null ? 'Validar Email' : 'Revalidar Email';
    const botonValidarId = `validate-${usuario.id}`;
    cardContent += `<button id="${botonValidarId}" class="btn-validate-individual" onclick="validarEmailIndividual(${usuario.id})" style="background-color: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin: 5px; font-size: 12px;">${botonValidarTexto}</button>`;

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

// Función para validar email localmente (sin API)
function validarEmailLocal(email) {
  // Regex más completa para validar emails  
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Lista de dominios comunes válidos
  const dominiosValidos = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.es',
    'icloud.com', 'live.com', 'msn.com', 'protonmail.com', 'tutanota.com'
  ];
  
  const formatoValido = regexEmail.test(email);
  
  if (!formatoValido) {
    return {
      esValido: false,
      razon: 'Formato de email inválido'
    };
  }
  
  const dominio = email.split('@')[1]?.toLowerCase(); // split : divide el string en dos partes, antes y después del '@' 
  const dominioConocido = dominiosValidos.includes(dominio);
  
  return {
    esValido: true,
    razon: dominioConocido ? 'Email válido (dominio conocido)' : 'Email válido (formato correcto)'
  };
}

// Función para validar email usando AbstractAPI (con proxy o servidor)
function validarEmailConAPI(email) {
  // API Key de AbstractAPI
  const API_KEY = 'cca5c0e3a5bc478e8da41203f61e75fb';
  
  // Para desarrollo local, usar validación local
  console.log('Usando validación local debido a limitaciones de CORS');
  const resultado = validarEmailLocal(email);
  
  return Promise.resolve({
    esValido: resultado.esValido,
    informacion: { email: email, is_valid_format: resultado.esValido },
    razon: resultado.razon
  });
  
  // CÓDIGO ORIGINAL DE LA API (comentado por CORS)
  /*
  const API_URL = `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(email)}`;

  console.log('Validando email:', email);
  console.log('URL de la API:', API_URL);

  return fetch(API_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API Key inválida o expirada');
        } else if (response.status === 429) {
          throw new Error('Límite de requests excedido');
        } else {
          throw new Error(`Error HTTP: ${response.status}`);
        }
      }
      return response.json();
    })
    .then((data) => {
      console.log('Datos recibidos de la API:', data);
      
      // Verificar si la respuesta contiene error
      if (data.error) {
        throw new Error(data.error.message || 'Error en la API');
      }

      // Validación simplificada y más permisiva
      const formatoValido = data.is_valid_format === true;
      const esEntregable = data.deliverability === 'DELIVERABLE';
      const esDesconocido = data.deliverability === 'UNKNOWN';
      
      // Considerar válido si tiene formato válido Y (es entregable O estado desconocido)
      const esValido = formatoValido && (esEntregable || esDesconocido);

      return {
        esValido: esValido,
        informacion: data,
        razon: getValidationReason(data),
      };
    })
    .catch((error) => {
      console.error('Error completo validando email:', error);
      return {
        esValido: null,
        informacion: null,
        razon: error.message || 'Error de conexión con API',
      };
    });
  */
}

// Función para obtener razón de validación (simplificada)
function getValidationReason(data) {
  console.log('Analizando razón de validación:', data);
  
  // Verificar formato
  if (!data.is_valid_format) {
    return 'Formato de email inválido';
  }

  // Verificar deliverability
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

// Para cambiar entre validación local y API con proxy, 
// cambia esta línea en validarEmailIndividual():
// validarEmailConAPI(usuario.email) por validarEmailConAPICors(usuario.email)

// Función para validar email individual
function validarEmailIndividual(idUsuario) {
  // Buscar el usuario
  const usuario = usuarios.find(u => u.id === idUsuario);
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

  // Verificar si ya está validando este email
  if (boton.disabled) {
    return; // Ya está en proceso
  }

  // Deshabilitar el botón y cambiar texto
  boton.disabled = true;
  boton.textContent = 'Validando...';
  boton.style.backgroundColor = '#6c757d'; // Color gris para indicar que está deshabilitado

  // Validar el email
  validarEmailConAPI(usuario.email)
    .then((resultado) => {
      // Actualizar el usuario con el resultado
      usuario.emailValido = resultado.esValido;
      usuario.razonValidacion = resultado.razon;

      // Guardar en localStorage
      guardarUsuariosEnStorage();

      // Actualizar la vista
      mostrarUsuarios();

      // Mostrar mensaje de éxito
      if (resultado.esValido === true) {
        mostrarMensajeExito(`Email de ${usuario.nombre} validado correctamente`);
      } else if (resultado.esValido === false) {
        mostrarMensajeError(`Email de ${usuario.nombre} es inválido: ${resultado.razon}`);
      } else {
        mostrarMensajeError(`Error validando email de ${usuario.nombre}: ${resultado.razon}`);
      }
    })
    .catch((error) => {
      console.error('Error en validación:', error);
      mostrarMensajeError(`Error validando email de ${usuario.nombre}`);
      
      // Rehabilitar el botón en caso de error
      boton.disabled = false;
      boton.textContent = usuario.emailValido === null ? 'Validar Email' : 'Revalidar Email';
      boton.style.backgroundColor = '#007bff';
    });
}