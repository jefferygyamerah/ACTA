# ACTA — argumento para evaluación, versión honesta

**Usuario:** colaborador de atención en sucursal que recibe documentos para una solicitud de cuenta; después, supervisor o colaborador que retoma el expediente.

**Trabajo terminado:** una revisión documental que explica qué se conserva, qué necesita aclararse y qué cambió cuando llegó la respuesta. Mantiene los archivos y ambas revisiones. No aprueba la cuenta.

**Escena concreta:** Lucía ya entregó su identificación. Su solicitud dice casa 14 y el comprobante casa 41; también falta respaldo de ingresos. ACTA ayuda a preparar esos dos pendientes. En la siguiente visita, el nuevo comprobante sustituye al anterior y se agrega la carta laboral. La identificación todavía válida permanece revisada.

**Papel de la IA:** QVAC propone tipo y campos con citas del documento en este equipo. El colaborador los confirma. La comparación de los datos revisados con la guía sintética es determinística.

**Ventaja de ejecución local:** el flujo demostrado no depende de una API de inferencia en la nube. No se ha demostrado aislamiento de red impuesto, integración bancaria, cifrado de registros ni despliegue en sucursal.

**Evidencia que se puede mostrar:** nueve etapas del flujo real completadas y 35 pruebas deterministas aprobadas; dos registros firmados conservados después de recargar, reiniciar el servicio y leerlos desde otro proceso; archivo original preservado; exportación alterada rechazada. El actor de prueba es una automatización, no un empleado.

**Problema que se debe declarar:** la lectura documental aún comete errores en documentos distintos a los del demo. La revisión de la fuente es obligatoria. El caso ensayado no es evidencia de exactitud general.

**Demanda y diferenciación:** la evidencia pública de SBP respalda fricciones documentales y de interpretación; no demuestra que sean el mayor problema de Caja. Pega, Fenergo y otros ya cubren partes importantes de esta categoría. La hipótesis de ACTA es una revisión local pequeña y verificable que preserva continuidad antes de una integración más amplia. No afirmar ausencia de competidores.

**Petición concreta al jurado:** evaluar la utilidad de esa continuidad y la ventaja del procesamiento local; si interesa, proponer una prueba con colaboradores y expedientes sintéticos bajo criterios acordados. No atribuir validación o adopción al banco.

[Estado verificable](plans/acta/00-status.md) · [Demanda y competidores](plans/acta/06-market-usecase.md) · [Protocolo de prueba](plans/acta/07-user-validation.md) · [Guion completo](demo-reconciliation-es.md)
