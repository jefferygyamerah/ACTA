# ACTA — Cada paso, con respaldo.

ACTA ayuda al colaborador de una sucursal a revisar los documentos de una solicitud de cuenta, preparar una sola lista justificada de pendientes y continuar el mismo expediente cuando el cliente regresa.

En el ejemplo ficticio, Lucía entrega una identificación válida, pero su comprobante y su solicitud muestran domicilios diferentes; además falta respaldo de ingresos. QVAC propone una lectura local de los PDF. El colaborador confirma los datos y el respaldo de los hallazgos. ACTA conserva la identificación, prepara los dos pendientes y guarda la revisión. Con la respuesta del cliente, muestra lo resuelto y deja el expediente listo para el supervisor.

El resultado es una revisión documental conservada con sus fuentes y su historial. No abre una cuenta, actualiza el CORE ni envía mensajes.

Prototipo para el reto de Caja de Ahorros. Usa colores extraídos de su sitio público; la guía y los casos son ficticios. No representa procedimientos de Caja ni una implementación oficial.

## Ejecutar

Requisitos del perfil verificado: Node.js 24, npm, Windows x64 y GPU compatible. El modelo ocupa aproximadamente 1,06 GB. Se descarga durante el aprovisionamiento.

```powershell
npm ci --no-audit --no-fund
npm run provision
npm run build
npm start
```

Abra http://127.0.0.1:4318. “Probar el caso de Lucía” carga los tres PDF sintéticos iniciales. La primera lectura verifica el modelo y carga QVAC; las siguientes reutilizan el modelo.

El modelo se guarda en `.local/models` y los casos en `.local/data`. Puede configurar `ACTA_MODEL_DIR`, `ACTA_DATA_DIR` y `PORT`. No se requieren repositorios hermanos. No copie una base de datos en uso; cierre primero el servidor.

## Recorrido de dos visitas

1. Seleccione cada PDF, ejecute “Leer con QVAC local” y contraste la propuesta con sus líneas de origen. Corrija lo necesario y confirme la lectura.
2. Abra “Comparar y aclarar”. Revise los datos y la regla sintética de cada hallazgo.
3. Confirme los hallazgos, prepare el texto exacto y guarde la primera revisión. Queda pendiente la aclaración de domicilio y el respaldo de ingresos.
4. Registre la respuesta del cliente en el mismo expediente. El nuevo comprobante sustituye expresamente al anterior; la carta laboral se añade como respaldo.
5. Revise las nuevas lecturas. Compruebe que ambos pendientes se resolvieron y que la identificación se conserva.
6. Guarde la segunda revisión, recargue, consulte ambas visitas y exporte el acta firmada.

Puede adjuntar PDF con texto, TXT o Markdown. Los escaneos sin texto se rechazan explícitamente; no se implementa OCR. Los datos extraídos son propuestas. Una coincidencia literal con la fuente no garantiza una interpretación correcta.

Cambiar una lectura invalida la confirmación de hallazgos. Las revisiones guardadas permanecen inmutables. La respuesta abre una nueva revisión. Guardar o copiar texto no acredita contacto con el cliente.

La consulta de procedimientos del primer prototipo se conserva en http://127.0.0.1:4318/legacy y mantiene su evidencia histórica.

## Validación y evidencia

```powershell
npm test
npm run build
node scripts/reconciliation-e2e.js
npm run test:e2e
```

La prueba de reconciliación usa Edge, PDF sintéticos y un almacén aislado. Registra las propuestas reales del modelo, cualquier corrección automática realizada contra anotaciones de prueba, revisión, persistencia, exportación y capturas. El actor `automation:synthetic-e2e` demuestra mecanismos de revisión; no representa aceptación de un empleado.

Los resultados vigentes y fallidos están separados en el [estado de entrega](docs/plans/acta/00-status.md). La evaluación anterior de selección de procedimientos no es una medida de exactitud de lectura documental.

- [Producto y usuario](docs/plans/acta/01-product.md)
- [Demanda, competidores y límites de la hipótesis](docs/plans/acta/06-market-usecase.md)
- [Arquitectura](docs/plans/acta/02-architecture.md)
- [Guion de demostración de dos visitas](docs/demo-reconciliation-es.md)
- [Operación local en Windows](docs/local-windows.md)
- [Procedencia y licencias](NOTICE.md)

Los registros SQLite, archivos y exportaciones son texto sin cifrar. Las firmas Ed25519 detectan cambios frente a la llave pública de confianza de la instalación; no acreditan identidad bancaria. No hay autenticación de empleados, autorización de producción ni envío de mensajes. Use datos sintéticos exclusivamente.

## Bases preexistentes

ACTA adapta componentes de **Vigía, desarrollado por el compañero de hackathon de Jeffery Gyamerah**, con la licencia MIT de Luis Alain preservada. Adapta el patrón de ejecución y revisión de Notare y reutiliza la base ACTA previamente construida: servicio de casos, SQLite, firmas, controles de revisión e interfaz.

El [inventario y NOTICE](NOTICE.md) identifica versiones, archivos reutilizados, adaptados y omitidos. La extensión añade lectura de PDF con texto, comparación documental, sustituciones explícitas y continuidad entre visitas. No se declara originalidad exclusiva sobre las capacidades de gestión documental o KYC.
