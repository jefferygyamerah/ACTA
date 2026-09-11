# ACTA en este equipo Windows

Destino acordado: uso local en este equipo, en http://127.0.0.1:4318. La versión validada está desplegada en .local/releases/candidate-7dc602c459. El recibo artifacts/evidence/reconciliation/local-deployment.json identifica su fuente, pruebas, proceso y comprobaciones de conservación de datos.

## Datos y modelo

Los expedientes conservados pertenecen a C:/Users/jeffe/Documents/ChatGPT/ACTA/.local/data. El modelo QVAC verificado está en C:/Users/jeffe/Documents/ChatGPT/ACTA/.local/models. La instalación de una nueva versión conserva ambos directorios. Las pruebas usan almacenes sintéticos separados.

No copie el archivo SQLite mientras el servicio está abierto. Para una copia de respaldo, cierre el servicio y conserve juntos todos los archivos de su directorio de datos, incluida la llave de firma. No publique ese directorio.

## Inicio manual desde el código del repositorio

En PowerShell:

```powershell
Set-Location 'C:/Users/jeffe/Documents/ChatGPT/ACTA'
$env:ACTA_MODEL_DIR = 'C:/Users/jeffe/Documents/ChatGPT/ACTA/.local/models'
$env:ACTA_DATA_DIR = 'C:/Users/jeffe/Documents/ChatGPT/ACTA/.local/data'
$env:PORT = '4318'
npm start
```

Mantenga esa terminal abierta y abra http://127.0.0.1:4318. Ctrl+C detiene ese servicio. Solo debe existir un servidor para el puerto y almacén indicados.

Para ejecutar la versión fijada después de su despliegue, use la ruta releasePath del recibo local-deployment.json como directorio de trabajo; mantenga las rutas de datos y modelo anteriores. El recibo identifica la versión por sus huellas de archivos, incluso si proviene de cambios todavía sin commit.

## Primer recorrido

“Probar el caso de Lucía” crea un expediente ficticio con tres PDF. Lea y confirme cada documento, revise los cuatro hallazgos y guarde la primera visita. Registre la fecha de respuesta, aporte el comprobante corregido y la carta laboral, revise las nuevas lecturas y guarde la segunda visita. El acta puede exportarse y verificarse desde la aplicación.

La lectura automática es una propuesta. Los campos deben contrastarse con las líneas de origen; la evaluación con documentos desconocidos conserva errores importantes. Si la lectura local falla, la lectura manual se registra como tal. No se implementa OCR para documentos escaneados.

## Alcance de la instalación

La instalación local usa datos y reglas sintéticos. No es un despliegue dentro del banco. Los registros son texto sin cifrar, y la revisión local no autentica a un empleado. La firma permite comprobar integridad frente a la llave de esta instalación.

La comprobación de instalación registra por separado dependencias nuevas, modelo reutilizado y verificado, pruebas deterministas, flujo real con QVAC, persistencia y salud del servicio desplegado. No equivale a instalación en otra computadora ni a aislamiento de red impuesto.

Para ejecutar pruebas desde una copia nueva que reutiliza el modelo por ACTA_MODEL_DIR, cree primero el directorio de trabajo con New-Item -ItemType Directory -Path .local -Force. La instalación normal del modelo dentro de la copia ya crea ese directorio. La comprobación limpia retuvo el fallo inicial por su ausencia y el resultado posterior de 35/35 pruebas.
