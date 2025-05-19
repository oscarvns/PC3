// Contador en tiempo real
document.getElementById("participantes").addEventListener("input", actualizarContador);

function actualizarContador() {
  const texto = document.getElementById("participantes").value;
  const lineas = texto.split('\n').map(l => l.trim()).filter(l => l !== "").slice(0, 100);
  document.getElementById("contador").textContent = `Integrantes: ${lineas.length}`;
}

function generarEquipos() {
  const textarea = document.getElementById("participantes");
  const participantes = textarea.value
    .split('\n')
    .map(p => p.trim())
    .filter(p => p !== "")
    .slice(0, 100); // máximo 100

  if (participantes.length === 0) {
    alert("Debe ingresar al menos un participante.");
    return;
  }

  const titulo = document.getElementById("tituloEquipos").value.trim() || "Equipos";
  const modo = document.getElementById("modo").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Ingrese una cantidad válida.");
    return;
  }

  const participantesBarajados = participantes.sort(() => Math.random() - 0.5);
  const equipos = [];

  let totalEquipos = 0;

  if (modo === "equipos") {
    totalEquipos = cantidad;
    for (let i = 0; i < totalEquipos; i++) equipos.push([]);
    participantesBarajados.forEach((p, i) => {
      equipos[i % totalEquipos].push(p);
    });
  } else {
    const porEquipo = cantidad;
    totalEquipos = Math.ceil(participantes.length / porEquipo);
    for (let i = 0; i < totalEquipos; i++) {
      equipos.push(participantesBarajados.slice(i * porEquipo, (i + 1) * porEquipo));
    }
  }

  // Ocultar pantalla1, mostrar pantalla2
  document.getElementById("pantalla1").style.display = "none";
  document.getElementById("pantalla2").style.display = "block";

  // Mostrar resultados
  document.getElementById("tituloResultado").innerText = titulo;
  const contenedor = document.getElementById("equipos");
  contenedor.innerHTML = "";

  equipos.forEach((grupo, i) => {
    const div = document.createElement("div");
    div.className = "equipo";
    const subtitulo = document.createElement("h3");
    subtitulo.textContent = `Equipo ${i + 1}`;
    div.appendChild(subtitulo);
    grupo.forEach(nombre => {
      const p = document.createElement("p");
      p.textContent = nombre;
      div.appendChild(p);
    });
    contenedor.appendChild(div);
  });
}

function copiarPortapapeles() {
  const texto = document.getElementById("equipos").innerText;
  navigator.clipboard.writeText(texto).then(() => alert("Copiado al portapapeles"));
}

function copiarPorColumnas() {
  const columnas = [];
  document.querySelectorAll(".equipo").forEach((equipo, idx) => {
    const miembros = Array.from(equipo.querySelectorAll("p")).map(p => p.textContent);
    columnas[idx] = miembros;
  });

  const maxFilas = Math.max(...columnas.map(c => c.length));
  let salida = "";
  for (let i = 0; i < maxFilas; i++) {
    salida += columnas.map(col => col[i] || "").join("\t") + "\n";
  }
  navigator.clipboard.writeText(salida).then(() => alert("Copiado por columnas"));
}

function descargarJPG() {
  const contenedor = document.getElementById("pantalla2");

  html2canvas(contenedor).then(canvas => {
    const link = document.createElement("a");
    link.download = "equipos.jpg";
    link.href = canvas.toDataURL("image/jpeg", 1.0);
    link.click();
  }).catch(error => {
    alert("Error al generar la imagen: " + error.message);
  });
}

