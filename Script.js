/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  script.js  –  ¿Lo intentamos de nuevo?                      ║
 * ║                                                               ║
 * ║  ÍNDICE:                                                      ║
 * ║    A. Configuración de fotos  ← EDITA AQUÍ                   ║
 * ║    B. Creación del botón No en el body                        ║
 * ║    C. Corazones de fondo                                      ║
 * ║    D. Fotos de la pareja                                      ║
 * ║    E. Lógica de huida del botón No                           ║
 * ║    F. Mensajes de intento fallido                             ║
 * ║    G. Crecimiento del botón Sí                                ║
 * ║    H. Clic en Sí – pantalla de éxito                         ║
 * ║    I. Corazones flotantes                                     ║
 * ║    J. Inicialización                                          ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

/* ══════════════════════════════════════════════════════════════
   A. CONFIGURACIÓN DE FOTOS
   ══════════════════════════════════════════════════════════════
   1. Copia tus fotos a la misma carpeta que index.html.
   2. Reemplaza '' con el nombre del archivo:
        const FOTO_IZQUIERDA = 'ella.jpg';
        const FOTO_DERECHA   = 'el.png';
   3. También funciona con URLs completas:
        const FOTO_IZQUIERDA = 'https://i.imgur.com/abc.jpg';
   4. Si dejas '' la foto no aparece (la página funciona igual). */

const FOTO_IZQUIERDA = '\img/ella.jpg'; // ← foto de la izquierda
const FOTO_DERECHA = '\img/yo.jpg'; // ← foto de la derecha

/* ══════════════════════════════════════════════════════════════
   B. CREACIÓN DEL BOTÓN NO EN EL BODY
   ══════════════════════════════════════════════════
   LA RAÍZ DEL PROBLEMA ANTERIOR:
   El botón No tenía position:fixed pero vivía dentro de
   #buttons-area en el HTML. Aunque fixed lo saca del flujo,
   su posición inicial (left/top automático del navegador)
   lo ponía encima del botón Sí.

   SOLUCIÓN: creamos el botón desde JS y lo agregamos
   directamente al <body>. Así nunca estuvo en el flujo de
   #buttons-area y arranca invisible (opacity:0). Solo se
   hace visible cuando JS calcula su posición correcta.        */

const btnNo = document.createElement('button');
btnNo.id = 'btn-no';
btnNo.className = 'btn btn-no'; /* estilos en style.css */
btnNo.textContent = 'No 😅';
btnNo.setAttribute('aria-label', 'No (inalcanzable)');
document.body.appendChild(btnNo); /* va al body, NO al main */

/* Referencias a elementos del HTML */
const btnYes = document.getElementById('btn-yes');
const failMsg = document.getElementById('fail-message');
const successScr = document.getElementById('success-screen');
const photosSection = document.getElementById('photos-section');

/* ══════════════════════════════════════════════════════════════
   C. CORAZONES DE FONDO
   ══════════════════════════════════════════════════════════════
   Genera emojis decorativos que parpadean detrás del contenido.
   Cambia `cantidad` para más o menos densidad. */

(function crearCorazonesDeFondo() {
  const contenedor = document.getElementById('bg-hearts');
  const emojis = ['💕', '❤️', '🌸', '✨', '💗', '🌹', '💞'];
  const cantidad = 28;

  for (let i = 0; i < cantidad; i++) {
    const el = document.createElement('span');
    el.className = 'bg-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = Math.random() * 100 + 'vh';
    el.style.animationDuration = 3 + Math.random() * 5 + 's';
    el.style.animationDelay = Math.random() * 5 + 's';
    el.style.opacity = (0.1 + Math.random() * 0.3).toFixed(2);
    contenedor.appendChild(el);
  }
})();

/* ══════════════════════════════════════════════════════════════
   D. FOTOS DE LA PAREJA
   ══════════════════════════════════════════════════════════════
   Solo inserta marcos si hay al menos una foto configurada. */

(function insertarFotos() {
  if (!FOTO_IZQUIERDA && !FOTO_DERECHA) return; /* nada que hacer */

  /**
   * Crea un marco circular con la foto o un emoji de fallback.
   * @param {string} src - Ruta o URL de la imagen
   * @param {string} alt - Descripción para accesibilidad
   */
  function crearMarco(src, alt) {
    const marco = document.createElement('div');
    marco.className = 'photo-frame';
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    /* Si la imagen no carga, mostrar emoji en su lugar */
    img.onerror = () => {
      marco.removeChild(img);
      marco.textContent = '💕';
    };
    marco.appendChild(img);
    return marco;
  }

  if (FOTO_IZQUIERDA) photosSection.appendChild(crearMarco(FOTO_IZQUIERDA, 'Foto izquierda'));

  const corazon = document.createElement('span');
  corazon.className = 'between-heart';
  corazon.textContent = '💗';
  photosSection.appendChild(corazon);

  if (FOTO_DERECHA) photosSection.appendChild(crearMarco(FOTO_DERECHA, 'Foto derecha'));
})();

/* ══════════════════════════════════════════════════════════════
   E. LÓGICA DE HUIDA DEL BOTÓN NO
   ══════════════════════════════════════════════════════════════ */

let failCount = 0; /* contador global de intentos fallidos */

/**
 * Calcula y aplica la posición inicial del botón No:
 * centrado horizontalmente junto al botón Sí.
 * Solo se llama UNA VEZ al cargar (ver sección J).
 */
function posicionarBotonNoInicial() {
  const rectSi = btnYes.getBoundingClientRect();
  const anchoNo = btnNo.offsetWidth || 130;
  const altoNo = btnNo.offsetHeight || 52;

  /* Alineado verticalmente con el botón Sí,
     y desplazado a su derecha con un gap */
  const gap = 24;
  const left = rectSi.right + gap;
  const top = rectSi.top + (rectSi.height - altoNo) / 2;

  /* Si no cabe a la derecha (pantalla angosta), va abajo */
  if (left + anchoNo > window.innerWidth - 16) {
    btnNo.style.left = rectSi.left + (rectSi.width - anchoNo) / 2 + 'px';
    btnNo.style.top = rectSi.bottom + gap + 'px';
  } else {
    btnNo.style.left = left + 'px';
    btnNo.style.top = top + 'px';
  }

  /* Ahora sí lo hacemos visible y activo */
  btnNo.classList.add('listo');
}

/**
 * Mueve el botón No a una posición aleatoria en la ventana.
 * Garantiza que no se salga de los bordes.
 * Se llama cada vez que el usuario intenta acercarse.
 */
function escaparBotonNo() {
  const ancho = btnNo.offsetWidth || 130;
  const alto = btnNo.offsetHeight || 52;
  const margen = 16;

  const maxX = window.innerWidth - ancho - margen;
  const maxY = window.innerHeight - alto - margen;

  btnNo.style.left = Math.max(margen, Math.random() * maxX) + 'px';
  btnNo.style.top = Math.max(margen, Math.random() * maxY) + 'px';

  failCount++;
  mostrarMensajeFallido();
  crecerBotonSi();
}

/* En desktop: el cursor se acerca → el botón escapa */
btnNo.addEventListener('mouseenter', escaparBotonNo);

/* En móvil: el dedo toca → el botón escapa */
btnNo.addEventListener(
  'touchstart',
  function (e) {
    e.preventDefault(); /* evita que se convierta en click */
    escaparBotonNo();
  },
  { passive: false },
);

/* Seguridad extra: si de alguna forma llegan a hacer click */
btnNo.addEventListener('click', function (e) {
  e.preventDefault();
  escaparBotonNo();
});

/* ══════════════════════════════════════════════════════════════
   F. MENSAJES DE INTENTO FALLIDO
   ══════════════════════════════════════════════════════════════
   Para agregar más mensajes: escribe una línea nueva en el array. */

const mensajes = [
  '¡No tan rápido! 😜',
  'Esa opción no está disponible ❤️',
  '¡Inténtalo otra vez! 😂',
  '¿En serio? Ese botón no es para ti 🙈',
  'El destino no quiere que le des clic 💫',
  'Ese botón tiene mejores planes 🌹',
  '¡Error 404: opción no encontrada! 💖',
  'Shhh, el No está de vacaciones 🏖️',
  '¿Otro intento? ¡Qué curioso! 😏',
  'Definitivamente ese no es el camino ✨',
];

let timerMensaje = null;

/**
 * Muestra el mensaje correspondiente al intento actual
 * y lo oculta automáticamente después de 2.5 segundos.
 */
function mostrarMensajeFallido() {
  failMsg.textContent = mensajes[(failCount - 1) % mensajes.length];
  failMsg.classList.add('visible');
  clearTimeout(timerMensaje);
  timerMensaje = setTimeout(() => failMsg.classList.remove('visible'), 2500);
}

/* ══════════════════════════════════════════════════════════════
   G. CRECIMIENTO DEL BOTÓN SÍ
   ══════════════════════════════════════════════════════════════
   Con cada intento fallido el botón Sí crece un 5%.
   Máximo: 2.2× su tamaño original. */

let escala = 1; /* escala actual del botón Sí */

function crecerBotonSi() {
  escala = Math.min(escala + 0.05, 2.2);
  /* Actualizamos la variable CSS --escala que usa la animación pulse */
  btnYes.style.setProperty('--escala', escala);
}

/* ══════════════════════════════════════════════════════════════
   H. CLIC EN SÍ – PANTALLA DE ÉXITO
   ══════════════════════════════════════════════════════════════
   handleYes() es global porque el HTML la llama con onclick. */

function handleYes() {
  lanzarCorazones(40); /* primera oleada */

  /* Ocultar el botón No y el mensaje de intentos fallidos */
  btnNo.style.display = 'none';
  failMsg.style.display = 'none';

  setTimeout(() => {
    successScr.classList.add('active'); /* muestra la pantalla de éxito */
    setTimeout(() => lanzarCorazones(70), 400); /* segunda oleada más densa */
  }, 300);
}

/* ══════════════════════════════════════════════════════════════
   I. CORAZONES FLOTANTES
   ══════════════════════════════════════════════════════════════
   Crea elementos que suben desde abajo con animación floatUp
   (definida en style.css). Se eliminan solos al terminar. */

/**
 * @param {number} cantidad - Cuántos corazones lanzar
 */
function lanzarCorazones(cantidad) {
  const emojis = ['💖', '💗', '💕', '❤️', '🌹', '✨', '💞', '💝'];
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < cantidad; i++) {
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    el.style.left = 5 + Math.random() * 90 + 'vw';
    el.style.bottom = '-60px';
    el.style.fontSize = 16 + Math.random() * 32 + 'px';
    el.style.animationDuration = (2.5 + Math.random() * 3.5).toFixed(1) + 's';
    el.style.animationDelay = (Math.random() * 1.5).toFixed(2) + 's';

    /* Auto-eliminación cuando termina la animación */
    el.addEventListener('animationend', () => el.remove());
    fragment.appendChild(el);
  }

  document.body.appendChild(fragment);
}

/* ══════════════════════════════════════════════════════════════
   J. INICIALIZACIÓN
   ══════════════════════════════════════════════════════════════
   Esperamos al evento 'load' (no solo DOMContentLoaded) para
   asegurarnos de que el navegador haya pintado y calculado
   las dimensiones reales de todos los elementos. */

window.addEventListener('load', () => {
  /*
    Doble requestAnimationFrame: garantiza que el navegador
    haya hecho al menos DOS ciclos de renderizado antes de
    que leamos las posiciones. Esto evita el bug de que
    getBoundingClientRect() devuelva ceros.
  */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      posicionarBotonNoInicial();
    });
  });
});

/* Si el usuario rota el teléfono o cambia el tamaño de ventana,
   reposicionamos para que el botón No no quede fuera de pantalla */
window.addEventListener('resize', () => {
  /* Solo reposicionar si el botón ya es visible */
  if (btnNo.classList.contains('listo')) {
    posicionarBotonNoInicial();
  }
});
