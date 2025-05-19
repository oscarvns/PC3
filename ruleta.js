        // Variables globales
        const colores = ['#4285f4', '#ea4335', '#34a853', '#fbbc05', '#9c27b0'];
        let listaElementos = [];
        let elementosOcultos = new Set(); // Usamos Set para mejor rendimiento
        let ultimoElementoSeleccionado = null;
        let angulo = 0;
        let girando = false;
        let modoEdicion = true;
        let elementosModificados = false;

        // Elementos del DOM
        const canvas = document.getElementById('ruleta');
        const ctx = canvas.getContext('2d');
        const textareaElementos = document.getElementById('listaElementos');
        const respuestaElemento = document.getElementById('respuesta');
        const btnIniciar = document.getElementById('btnIniciar');
        const btnReiniciar = document.getElementById('btnReiniciar');
        const btnEditar = document.getElementById('btnEditar');
        const btnPantallaCompleta = document.getElementById('btnPantallaCompleta');
        const centroRuleta = document.querySelector('.centro-ruleta');
        const contadorElementos = document.getElementById('contador-elementos');
        const ruletaContainer = document.querySelector('.ruleta-container');

        // F4 y F7: Función para inicializar y habilitar edición en textarea
        function inicializarTextarea() {
            textareaElementos.addEventListener('click', habilitarEdicion);
            textareaElementos.addEventListener('input', () => {
                actualizarRuleta();
                elementosModificados = true;
            });
        }

        // F7: Función para habilitar la edición del textarea
        function habilitarEdicion() {
            modoEdicion = true;
            textareaElementos.focus();
        }

        // F5: Actualizar la ruleta cuando se modifica el textarea
        function actualizarRuleta() {
            const texto = textareaElementos.value;
            listaElementos = texto.split('\n').filter(item => item.trim() !== '');
            
            // Actualizar contador de elementos visibles
            const elementosVisibles = listaElementos.filter(item => !elementosOcultos.has(item.trim()));
            contadorElementos.textContent = elementosVisibles.length;
            
            dibujarRuleta();
        }

        // F1 y F2: Función para dibujar la ruleta con sus sectores y colores
        function dibujarRuleta() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Filtrar elementos visibles
            const elementosVisibles = listaElementos.filter(item => !elementosOcultos.has(item.trim()));
            
            if (elementosVisibles.length === 0) {
                // Dibujar círculo gris cuando no hay elementos
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, 0, 2 * Math.PI);
                ctx.fillStyle = '#cccccc';
                ctx.fill();
                ctx.strokeStyle = '#999999';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Mensaje en el centro
                ctx.fillStyle = '#666666';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('No hay elementos', canvas.width / 2, canvas.height / 2);
                return;
            }
            
            const centro = canvas.width / 2;
            const radio = canvas.width / 2 - 10;
            const anguloSector = (2 * Math.PI) / elementosVisibles.length;
            
            for (let i = 0; i < elementosVisibles.length; i++) {
                const anguloInicio = angulo + i * anguloSector;
                const anguloFin = anguloInicio + anguloSector;
                
                // Color para este sector (rotamos entre los 5 colores base)
                const colorIndice = i % colores.length;
                
                // Dibujar sector
                ctx.beginPath();
                ctx.moveTo(centro, centro);
                ctx.arc(centro, centro, radio, anguloInicio, anguloFin);
                ctx.closePath();
                ctx.fillStyle = colores[colorIndice];
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Dibujar texto
                ctx.save();
                ctx.translate(centro, centro);
                ctx.rotate(anguloInicio + anguloSector / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                
                // Ajustar texto para que quepa
                const texto = elementosVisibles[i];
                const maxLongitud = Math.min(radio * 0.7, 120);
                let textoAjustado = texto;
                
                if (ctx.measureText(texto).width > maxLongitud) {
                    // Acortar texto si es muy largo
                    let longitud = texto.length;
                    while (ctx.measureText(textoAjustado + '...').width > maxLongitud && longitud > 0) {
                        longitud--;
                        textoAjustado = texto.substring(0, longitud) + '...';
                    }
                }
                
                ctx.fillText(textoAjustado, radio - 20, 5);
                ctx.restore();
            }
        }

        // F3: Función para girar la ruleta
        function girarRuleta() {
            if (girando) return;
            
            // Filtrar elementos visibles
            const elementosVisibles = listaElementos.filter(item => !elementosOcultos.has(item.trim()));
            
            if (elementosVisibles.length === 0) {
                respuestaElemento.textContent = "No hay elementos disponibles";
                respuestaElemento.classList.add('resaltado');
                setTimeout(() => respuestaElemento.classList.remove('resaltado'), 1000);
                return;
            }
            
            girando = true;
            ruletaContainer.classList.add('girando');
            centroRuleta.textContent = 'Girando...';
            respuestaElemento.textContent = 'Seleccionando...';
            
            // Reproducir sonido (opcional)
            reproducirSonido();
            
            // Generar ángulo aleatorio (entre 2 y 5 vueltas completas)
            const vueltasCompletas = 2 + Math.random() * 3;
            const anguloFinal = angulo + (Math.PI * 2 * vueltasCompletas);
            
            // Animación de giro
            const tiempoInicio = performance.now();
            const duracionGiro = 3000; // 3 segundos
            
            function animarGiro(tiempoActual) {
                const tiempoTranscurrido = tiempoActual - tiempoInicio;
                const progreso = Math.min(tiempoTranscurrido / duracionGiro, 1);
                
                // Ecuación de ralentización para que el giro vaya frenando
                const factorEasing = 1 - Math.pow(1 - progreso, 3);
                angulo = angulo + (anguloFinal - angulo) * factorEasing;
                
                dibujarRuleta();
                
                if (progreso < 1) {
                    requestAnimationFrame(animarGiro);
                } else {
                    finalizarGiro(elementosVisibles);
                }
            }
            
            requestAnimationFrame(animarGiro);
        }

        // Función para reproducir sonido de giro (opcional)
        function reproducirSonido() {
            // Si quieres implementar un sonido, puedes agregarlo aquí
            // const audio = new Audio('ruta/al/sonido.mp3');
            // audio.play();
        }

        // Función para determinar y mostrar el elemento seleccionado
        function finalizarGiro(elementosVisibles) {
            girando = false;
            ruletaContainer.classList.remove('girando');
            centroRuleta.textContent = 'Click para girar';
            
            // Normalizar ángulo entre 0 y 2π
            angulo = angulo % (Math.PI * 2);
            
            // Calcular el sector seleccionado
            const anguloSector = (2 * Math.PI) / elementosVisibles.length;
            const sectorSeleccionado = Math.floor(((2 * Math.PI) - angulo) / anguloSector) % elementosVisibles.length;
            
            ultimoElementoSeleccionado = elementosVisibles[sectorSeleccionado];
            respuestaElemento.textContent = ultimoElementoSeleccionado;
            respuestaElemento.classList.add('resaltado');
            
            setTimeout(() => {
                respuestaElemento.classList.remove('resaltado');
            }, 1500);
        }

        // F6 y F7: Función para resaltar y ocultar el último elemento seleccionado
        function ocultarElementoSeleccionado() {
            if (!ultimoElementoSeleccionado) return;
            
            // Agregar a la lista de elementos ocultos
            elementosOcultos.add(ultimoElementoSeleccionado.trim());
            
            // Resaltar en el textarea
            resaltarElementosEnTextarea();
            
            // Actualizar el contador de elementos visibles
            const elementosVisibles = listaElementos.filter(item => !elementosOcultos.has(item.trim()));
            contadorElementos.textContent = elementosVisibles.length;
            
            // Redibujar la ruleta
            dibujarRuleta();
            
            // Actualizar el mensaje de respuesta
            respuestaElemento.textContent = `"${ultimoElementoSeleccionado}" oculto`;
        }

        // Función para aplicar el resaltado en el textarea - mejorada
        function resaltarElementosEnTextarea() {
            // Crear un contenedor temporal con estilos
            let contenido = '';
            const lineas = textareaElementos.value.split('\n');
            
            for (let i = 0; i < lineas.length; i++) {
                const lineaTrim = lineas[i].trim();
                if (elementosOcultos.has(lineaTrim)) {
                    lineas[i] = '*' + lineas[i]; // Añadimos un marcador para los elementos ocultos
                }
            }
            
            // Actualizamos el textarea con los elementos marcados
            textareaElementos.value = lineas.join('\n');
            
            // Aplicamos un estilo visual al textarea para indicar elementos ocultos
            if (elementosOcultos.size > 0) {
                textareaElementos.style.backgroundColor = '#f9f9f9';
            } else {
                textareaElementos.style.backgroundColor = 'white';
            }
        }

        // F8: Función para reiniciar la ruleta
        function reiniciarRuleta() {
            elementosOcultos.clear();
            ultimoElementoSeleccionado = null;
            respuestaElemento.textContent = 'Ruleta reiniciada';
            respuestaElemento.classList.add('resaltado');
            
            setTimeout(() => {
                respuestaElemento.classList.remove('resaltado');
                respuestaElemento.textContent = 'Gira la ruleta';
            }, 1500);
            
            // Eliminar todos los marcadores * del textarea
            let lineas = textareaElementos.value.split('\n');
            lineas = lineas.map(linea => linea.startsWith('*') ? linea.substring(1) : linea);
            textareaElementos.value = lineas.join('\n');
            
            // Restaurar el estilo del textarea
            textareaElementos.style.backgroundColor = 'white';
            
            // Actualizar contador
            contadorElementos.textContent = listaElementos.length;
            
            // Redibujar la ruleta
            dibujarRuleta();
        }

        // F9: Función para activar la pantalla completa
        function activarPantallaCompleta() {
            const elem = document.documentElement;
            
            if (!document.fullscreenElement) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) { /* Safari */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE11 */
                    elem.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
            }
        }

        // Inicialización y eventos
        function inicializar() {
            // Cargar elementos iniciales
            actualizarRuleta();
            
            // Evento de click en la ruleta
            canvas.addEventListener('click', girarRuleta);
            centroRuleta.addEventListener('click', girarRuleta);
            
            // Botones
            btnIniciar.addEventListener('click', girarRuleta);
            btnReiniciar.addEventListener('click', reiniciarRuleta);
            btnEditar.addEventListener('click', habilitarEdicion);
            btnPantallaCompleta.addEventListener('click', activarPantallaCompleta);
            
            // Eventos de teclado
            document.addEventListener('keydown', (e) => {
                if (girando) return;
                
                switch(e.key.toLowerCase()) {
                    case ' ':  // Espacio
                        e.preventDefault(); // Evitar scroll
                        girarRuleta();
                        break;
                    case 's':
                        ocultarElementoSeleccionado();
                        break;
                    case 'r':
                        reiniciarRuleta();
                        break;
                    case 'e':
                        habilitarEdicion();
                        break;
                    case 'f':
                        activarPantallaCompleta();
                        break;
                }
            });
            
            // Inicializar textarea
            inicializarTextarea();
            
            // Mensaje inicial
            setTimeout(() => {
                respuestaElemento.textContent = 'Gira la ruleta';
            }, 500);
        }

        // Iniciar la aplicación cuando la página esté cargada
        window.addEventListener('load', inicializar);