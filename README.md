# ACTA

**Revisión de expedientes bancarios y preparación del siguiente paso, con IA local.**

ACTA es una propuesta para ayudar al personal de una sucursal a consultar procedimientos, revisar solicitudes incompletas y dejar un expediente claro para la siguiente persona. Como función de apoyo, cuando corresponde contactar al cliente, prepara una plantilla de correo, mensaje breve o guía de conversación para revisión del colaborador.

> **Estado: documentación y planificación.** Este repositorio todavía no contiene la aplicación, un modelo ejecutable ni resultados propios de pruebas. La reutilización de componentes de Vigía está planificada. La demostración utilizará una entidad, procedimientos y clientes ficticios.

## Autoría y reutilización

[Vigía](https://github.com/cpu-16/vigia) fue desarrollado por un compañero de hackathon de Jeffery Gyamerah. ACTA prevé reutilizar componentes de ese trabajo, incluido su módulo bancario, y conservar sus avisos de autoría y licencia. Las adaptaciones y aportaciones específicas de ACTA se documentarán de forma explícita; por ahora este repositorio contiene únicamente planificación. Ver [procedencia y atribución](NOTICE.md).

## Flujo previsto

1. Abrir una solicitud ficticia y consultar el procedimiento aplicable.
2. Mostrar el pasaje de respaldo y la versión de la guía.
3. Registrar el documento pendiente y el siguiente paso revisado.
4. Preparar una plantilla de contacto cuando corresponda.
5. Guardar la revisión para que otro colaborador comprenda el caso.

El cierre de una revisión no activa una cuenta ni resuelve documentos pendientes. Copiar una plantilla no significa que se haya contactado al cliente.

## Documentación

| Documento | Contenido |
|---|---|
| [Plan del producto y ejecución](docs/plan.md) | Alcance, reutilización técnica, evaluación, cronograma y video de 4:55 |
| [Investigación en Panamá](docs/research-panama.md) | Competidores, evidencia del problema, fuentes y límites |
| [Contacto, privacidad y ciberseguridad](docs/privacy-security.md) | Plantillas, normativa consultada, límites del prototipo y requisitos de un piloto real |
| [Decisiones acordadas](docs/decisions.md) | Nombre, enfoque bancario, límites de alcance y criterios |
| [Hackathon y requisitos](docs/HACKATHON.md) | Evento, desafío, plazo, reglas y evidencia pendiente |
| [Lista de entrega](docs/submission-checklist.md) | Pendientes de implementación, pruebas y presentación |
| [Procedencia y atribución](NOTICE.md) | Repositorios de referencia y tratamiento de sus licencias |

## Evidencia y límites

La investigación reúne fuentes públicas de la Superintendencia de Bancos de Panamá, Caja de Ahorros y proveedores. Sustenta un problema sectorial; aún no valida la frecuencia del problema ni el ahorro de tiempo dentro de Caja. Las soluciones comparables y sus limitaciones están documentadas en [la investigación](docs/research-panama.md).

La ejecución local no equivale a cumplimiento legal ni a seguridad demostrada. Los registros del componente de origen inspeccionado son texto plano; las firmas detectan alteraciones y no cifran el contenido. Para esta fase se utilizarán exclusivamente datos sintéticos. La evaluación de un despliegue con información real corresponde al banco y a sus responsables de privacidad y seguridad.

## Hackathon y desafío

ACTA se prepara para el **[Decentralized AI Hackathon](https://www.trydojo.io/hackathons/decentralized-ai-hackathon)**, celebrado del **9 al 11 de septiembre de 2026** en el marco del ISD Summit, con Tether como socio técnico.

| Detalle | Candidatura de ACTA |
|---|---|
| Desafío | **Caja de Ahorros — Soluciones de AI Descentralizada para la Banca** ([Track 05](https://www.trydojo.io/hackathons/decentralized-ai-hackathon?tab=tracks)) |
| Modalidad | Construcción remota durante 48 horas; asistencia presencial opcional el 11 de septiembre en Ciudad de Panamá |
| Cierre de entregas | **11 de septiembre de 2026, 08:00 Panamá (UTC−5 / 13:00 UTC)** |
| Entrega | Repositorio accesible al jurado y video propio de **máximo cinco minutos, en español**, accesible sin credenciales |
| Requisito técnico | QVAC, con inferencia local o entre pares; sin API de inferencia en la nube |
| Datos del prototipo | Exclusivamente sintéticos; el reto prohíbe datos reales de clientes de cualquier entidad financiera |

El encaje propuesto es la revisión de expedientes, la consulta de procedimientos y el traspaso claro de solicitudes incompletas entre colaboradores. Las plantillas de contacto son una función secundaria. Esta candidatura no implica validación, aceptación ni respaldo de Caja de Ahorros.

Los [detalles y requisitos del hackathon](docs/HACKATHON.md) recogen las fuentes oficiales, la evaluación y los pendientes de entrega. El repositorio continúa privado; su acceso por el jurado debe verificarse antes del cierre. Los documentos de planificación técnica están en inglés; el guion y la demostración se prepararán en español.

## Licencia

El contenido original de este repositorio se publica bajo [MIT](LICENSE). Las licencias y avisos de componentes incorporados posteriormente deberán conservarse; ver [NOTICE](NOTICE.md).
