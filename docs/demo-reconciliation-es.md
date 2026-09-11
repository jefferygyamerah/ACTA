# ACTA — Guion y formato para aprobación

Estado: compilación, pruebas y despliegue local verificados. Los criterios generales y de Caja proporcionados por el usuario ya están incorporados. Propuesta editorial lista para revisión final. Requiere aprobación expresa del guion y formato. No se ha generado esta narración ni ensamblado el video final.

## Formato propuesto

- Video horizontal 16:9, 1920 × 1080, MP4 H.264, 30 fps.
- Duración objetivo: 4 minutos 30 segundos; límite de entrega: menos de 5 minutos.
- Idioma: español. Voz ElevenLabs elegida por el usuario: `uFIr22uwx4X0yvGodynp`.
- Captura del escritorio real: Edge visible operado con Playwright, junto a telemetría de Windows/QVAC durante una lectura continua. Después, acercamientos al documento, los pendientes y el historial. Texto legible y subtítulos en español.
- Apertura y cierre breves con ACTA y los colores Caja del proyecto. Narración sin presentador ni música de fondo.
- Cortes para navegación y espera, sin inventar respuestas ni ocultar correcciones. Los resultados que aparezcan deberán corresponder a la grabación real.
- Las fuentes, pruebas y límites completos estarán en el repositorio. Los créditos de bases preexistentes permanecen en README y NOTICE.

Los tiempos son ventanas de edición, no mediciones de velocidad del proceso bancario. El contenido entre comillas es la narración exacta propuesta. Las indicaciones de pantalla no se narran.

## 0:00–0:20 · Apertura de producto

**Pantalla:** fondo blanco, tipografía grande en azul oscuro y una entrada breve de una captura real de ACTA. A los cinco segundos aparece ACTA; entre los segundos ocho y dieciséis se ve la interfaz y su etiqueta para personal de sucursal. Las frases “Conservar lo revisado” y “Aclarar lo pendiente” se asocian a elementos reales de la aplicación. Transición al escritorio Windows al terminar.

“Una nueva visita no debería significar empezar de nuevo.

Esto es ACTA.

Revisión documental para el personal de sucursal. Conservar lo revisado. Aclarar lo pendiente.

Con inteligencia que corre aquí.”

**Dirección:** pausas breves y voz segura; una idea visual a la vez. Esta apertura de estilo keynote incorpora los criterios confirmados y sigue pendiente de aprobación. Las capturas de producto deben corresponder a ACTA.

## 0:20–0:40 · Un caso concreto

**Pantalla:** expediente de Lucía y los tres PDF iniciales. Señalar domicilio en solicitud y comprobante, y el respaldo de ingresos pendiente.

“Veamos a Lucía, una cliente ficticia. Ya entregó su identificación, pero su comprobante dice casa cuarenta y uno y su solicitud dice casa catorce. Además, falta el respaldo de ingresos.

El colaborador necesita aclarar esos pendientes y conservar lo que ya revisó.”

## 0:40–1:30 · Lectura local y revisión

**Pantalla:** escritorio real con ACTA y la GPU/proceso local. Grabar una lectura sin cortes desde el clic hasta la respuesta. Mostrar el recibo de esa misma ejecución: versión del SDK QVAC, modelo, proceso, ejecución local sin delegación y contadores nativos. Después, mostrar texto original, valor propuesto y línea de origen; confirmar las lecturas. Mantener visible que los datos y las reglas son sintéticos.

“Estos documentos son PDF con texto. El SDK de QVAC ejecuta la lectura en este equipo y propone los datos con sus líneas de origen, sin enviar la inferencia a una API en la nube.

Aquí vemos la lectura en curso en mi PC. Al terminar, el registro identifica el modelo local, la ejecución en GPU y sus contadores de tokens.

El colaborador compara cada propuesta con el documento antes de confirmarla. Si encuentra un error, puede corregir el dato o la clasificación.

Una cita exacta ayuda a revisar, pero no garantiza que la inteligencia artificial haya entendido bien. La confirmación del colaborador sigue siendo necesaria.”

**Condición de edición:** si la ejecución grabada requiere una corrección, mostrarla expresamente. No presentar una lectura manual como resultado de QVAC.

## 1:30–2:15 · Una solicitud justificada

**Pantalla:** abrir la comparación; mostrar identificación conservada, conflicto de domicilio y ausencia de ingresos. Abrir el respaldo de los hallazgos, confirmar, revisar el texto exacto y guardar la primera visita.

“Con las lecturas confirmadas, ACTA compara el expediente con una guía de demostración. La IA propone los datos; la comparación aplica reglas explícitas.

La identificación se conserva. El domicilio necesita aclaración y falta un respaldo de ingresos.

El texto preparado reúne esos dos pendientes y sus motivos. No vuelve a pedir la identificación. El colaborador revisa el texto exacto y guarda la primera visita.

El resultado es una revisión documental. ACTA no envía este mensaje ni aprueba la apertura de una cuenta.”

## 2:15–3:20 · Continuar cuando el cliente regresa

**Pantalla:** reanudar el mismo expediente con fecha explícita; cargar el comprobante corregido como sustitución; añadir la carta laboral. Mostrar detección de una copia idéntica de la identificación. Leer y revisar las nuevas fuentes; comparar los cambios.

“Lucía regresa con la información. Continuamos el mismo expediente y registramos la fecha de esta nueva revisión.

El comprobante corregido sustituye expresamente al anterior. La carta laboral se añade como respaldo de ingresos. Si intentamos adjuntar la misma identificación, ACTA detecta la copia y evita duplicarla.

Revisamos las nuevas lecturas. Ahora vemos qué cambió entre visitas: domicilio e ingresos resueltos. La identificación y la solicitud permanecen revisadas.

Quien retoma el caso puede ver qué cambió y qué documentos siguen respaldando la revisión. El expediente queda listo para revisión del supervisor, según esta guía sintética.”

## 3:20–4:00 · Conservar el trabajo revisado

**Pantalla:** guardar segunda visita; mostrar ambas revisiones. Recargar y demostrar recuperación tras reiniciar el servicio. Exportar, verificar original y mostrar rechazo de una copia modificada con el verificador real. Mostrar brevemente el resultado ya retenido de esta versión: 35/35 pruebas deterministas y 9/9 etapas del flujo local. Identificarlo como pruebas de software; no presentarlo como exactitud del modelo.

“Guardamos la segunda revisión sin reemplazar la primera. Se conservan el texto aprobado, los documentos y el historial.

Después de recargar y reiniciar el servicio, las dos revisiones siguen disponibles.

El acta exportada se verifica frente a la llave local de esta instalación. Si modificamos su contenido, la verificación falla.

Esto permite comprobar la integridad del registro; no certifica una identidad bancaria.”

**Condición de edición:** usar evidencia real del reinicio y del verificador. Una tarjeta explicativa no sustituye la ejecución.

## 4:00–4:30 · Valor y siguiente paso

**Pantalla:** expediente final con dos visitas; cierre ACTA: “Conservar lo revisado. Aclarar lo pendiente.” Nota visible: “Prototipo · datos y guía sintéticos”.

“ACTA reúne lectura local, revisión de fuentes y continuidad entre visitas: conservar lo revisado y pedir solo lo pendiente.

Esta demostración utiliza datos y una guía sintéticos. El siguiente paso es medir con personal del banco la precisión de los pendientes y el tiempo de revisión.

ACTA. Cada paso, con respaldo.”

## Alcance que la edición debe preservar

No atribuir reglas a Caja de Ahorros, afirmar adopción bancaria, ausencia de competidores o ahorros no medidos. No afirmar cifrado ni aislamiento de red impuesto. La prueba automatizada acredita mecanismos y persistencia, no aceptación de un empleado.

## Aprobación antes de producir

El usuario debe aprobar este guion exacto y el formato propuesto después de finalizar compilación, pruebas y despliegue local. Hasta entonces, no generar audio con ElevenLabs ni ensamblar el video final. Los videos históricos y las grabaciones de pruebas no son esta entrega final.

## Toma continua: inferencia en este PC

Propuesta actualizada por petición del usuario: usar Playwright para operar un Edge visible y FFmpeg para capturar una región del escritorio real que incluya el navegador y la telemetría de Windows. La grabación de viewport de Playwright puede conservarse como respaldo técnico; la toma principal mostrará las ventanas reales.

En el tramo 0:40–1:30:

1. Mostrar ACTA y su dirección local, junto al proceso de QVAC y el nombre de la GPU.
2. Pulsar “Leer con QVAC local”. Mantener una toma continua, a velocidad normal, desde el clic hasta la respuesta. La duración real de la lectura no se altera.
3. Mostrar actividad de cómputo de la GPU durante la lectura, con los datos que Windows/NVIDIA realmente expongan.
4. Al terminar, mostrar un resumen legible del recibo de ESA lectura: identificador del proceso y ejecución, modelo, QVAC, isDelegated=false, backendDevice=gpu, hora de inicio/fin y contadores nativos. Los contadores finales se presentan después de completar el trabajo, no como telemetría en vivo.
5. Volver al documento, contrastar el valor con su línea de origen y confirmar la lectura.

El gráfico de GPU por sí solo no demuestra la ruta de inferencia. Vincular el proceso local, su relación con ACTA y el recibo real de esa misma ejecución. No presentar un ejemplo de una prueba anterior como recibo de la lectura que se está filmando.

Disponibilidad comprobada en este equipo: FFmpeg 9.0.1 incluye gdigrab; NVIDIA identifica una GeForce RTX4050 Laptop GPU y el proceso bare.exe de esta versión de ACTA. El SDK informa ejecución local, isDelegated=false y el modelo Qwen3-1.7B-Q4_0. Las pruebas retenidas incluyen backendDevice=gpu y contadores de tokens. Es comprobación de capacidades y evidencia previa; aún no se ha grabado esta toma de escritorio.

En Windows, nvidia-smi devuelve N/A para memoria por proceso en este equipo. No inventar esas cifras ni atribuir toda actividad global de GPU a ACTA. Seleccionar el gráfico de cómputo disponible o mostrar la telemetría que efectivamente funcione, con su alcance claro. Usar codificación por CPU para evitar que la grabación añada actividad al codificador de la misma GPU durante la toma de prueba.

El encuadre mostrará solo ACTA y las ventanas de demostración. No abrir chats, credenciales ni otros contenidos personales. No desactivar conexiones ni modificar el firewall como parte de esta propuesta. No se afirma aislamiento de red impuesto.

Referencias técnicas: [Playwright headed](https://playwright.dev/docs/browsers), [video de viewport](https://playwright.dev/docs/videos), [captura de escritorio FFmpeg](https://www.ffmpeg.org/ffmpeg-devices.html#gdigrab), [alcance de NVIDIA-SMI](https://docs.nvidia.com/deploy/nvidia-smi/index.html).

La aprobación del guion y formato sigue pendiente. Tras aprobarlos se hará una comprobación breve del encuadre y la captura antes de la toma final.

## Revisión editorial y criterios

La dirección de apertura y el mapa confirmado de criterios están en [demo-direction-and-judging.md](demo-direction-and-judging.md). Se incorporaron los criterios generales (35/25/20/10/10), sus desempates y los tres criterios de Caja sin ponderaciones publicadas. La siguiente decisión es aprobar este guion exacto y formato. Ningún puntaje o premio está garantizado.
