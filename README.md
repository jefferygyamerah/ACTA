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
| [Lista de entrega](docs/submission-checklist.md) | Pendientes de implementación, pruebas y presentación |
| [Procedencia y atribución](NOTICE.md) | Repositorios de referencia y tratamiento de sus licencias |

## Evidencia y límites

La investigación reúne fuentes públicas de la Superintendencia de Bancos de Panamá, Caja de Ahorros y proveedores. Sustenta un problema sectorial; aún no valida la frecuencia del problema ni el ahorro de tiempo dentro de Caja. Las soluciones comparables y sus limitaciones están documentadas en [la investigación](docs/research-panama.md).

La ejecución local no equivale a cumplimiento legal ni a seguridad demostrada. Los registros del componente de origen inspeccionado son texto plano; las firmas detectan alteraciones y no cifran el contenido. Para esta fase se utilizarán exclusivamente datos sintéticos. La evaluación de un despliegue con información real corresponde al banco y a sus responsables de privacidad y seguridad.

## Entrega del hackathon

Se prepara una candidatura bancaria independiente para el [reto de Caja de Ahorros](https://www.trydojo.io/hackathons/decentralized-ai-hackathon?tab=tracks), con un video propio de hasta cinco minutos. Antes de entregar, se verificará el acceso del jurado al repositorio y al video. El repositorio se inicia como privado.

Los documentos de planificación técnica están en inglés; el guion y la demostración se prepararán en español.

## Licencia

El contenido original de este repositorio se publica bajo [MIT](LICENSE). Las licencias y avisos de componentes incorporados posteriormente deberán conservarse; ver [NOTICE](NOTICE.md).
