# Customer contact, privacy and security

Assessment recorded 10 September 2026. Proposed controls have not been implemented or tested in ACTA.

**Customer-contact drafting: conditional scope after privacy review**

Decision: retain this feature as a staff-facing, template-based aid for the synthetic hackathon demonstration. Production use with customer records remains subject to the bank's privacy, legal and security assessment. Local execution alone does not establish compliance.

The workflow hypothesis remains useful: a reviewed next action can become clear customer wording without the employee reconstructing the case. This research does not prove that Caja lacks adequate communication templates.

Panama's Law 81 of 2019 sets conditions for lawful processing, including consent and specified contractual/legal grounds. An employee clicking “review” is not the customer's consent and does not establish a lawful basis. [Law 81, article 6](https://www.antai.gob.pa/wp-content/uploads/2019/09/Ley-81-de-2019-Proteccion-de-Datos-Personales.pdf)

SBP Agreement 1-2022 applies privacy principles from design, governs retention and documented processing, and links data security to banking technology controls. Relevant provisions include articles 5, 13, 16 and 24–25. It does not certify this prototype or automatically authorize a particular communication channel. [Banking data-protection agreement](https://www.superbancos.gob.pa/documentos/leyes_y_regulaciones/acuerdos/2022/Acuerdo_01-2022.pdf?v=1.02)

Caja's published privacy policy cites Law 81, Decree 285 of 2021 and Agreement 1-2022, and includes customer communications among processed data. That policy is context, not permission for a third-party prototype to process customers' records. [Caja privacy policy](https://www.cajadeahorros.com.pa/proteccion-datos-personales/)

**Smallest sensible version**

Add “Preparar contacto” only after a reviewed next action calls for customer contact. The app assembles wording from a controlled template, the confirmed missing-item category and a confirmed delivery route. The existing local AI helps select the source-backed procedure; a second free-form model pass is unnecessary for this timebox.

| Format | Content boundary |
|---|---|
| Short message | Generic follow-up wording for an approved channel; avoid detailed document or account information where the recipient has not been verified |
| Email | A subject and concise body; include case-specific details only under the bank's approved recipient/channel procedure |
| Conversation guide | A brief explanation for use after the employee follows the bank's identity-verification procedure |

Use a neutral greeting. Names, email addresses, phone numbers, identity documents, balances and customer uploads are not needed by the template composer. A case identifier can still be personal data if it can be linked back to a person; omitting a name is not anonymization.

The approved guide/source remains visible to staff. Internal risk notes, legal deliberations, procedure identifiers and supervisor discussion stay out of customer wording.

The MVP uses controlled fields and a preview. The employee reviews the wording and can adapt it inside the bank's existing approved communication system. That keeps a new unrestricted customer-data text box out of this prototype.

Illustrative wording, for a synthetic case with the document and delivery route already confirmed: “Para continuar con la revisión de su solicitud, está pendiente su comprobante de ingresos. Puede presentarlo en la sucursal para que podamos continuar la revisión.” This is not a statement of Caja policy or an approval promise.

**Cybersecurity choices for the prototype**

These are proposed design controls, not claims about implemented or legally sufficient safeguards.

- The composer has no sending capability, recipient directory, email credentials or messaging API tokens. Do not ingest customer messages or attachments for this feature.
- Fill required-document and route fields from reviewed, controlled values. Do not generate links, account numbers, deadlines, credential requests or approval promises.
- Render text as text; do not execute model output or render untrusted HTML/remote images. If model-based wording is added later, treat its output as untrusted and validate it before review.
- Verify that the demo performs inference locally and that customer/case content is not included in telemetry, crash reports or model requests. Provisioning a model is separate from processing a case.
- Keep internal notes out of copied wording. Copy only on an explicit employee action. For real use, clipboard history/synchronization and the recipient channel would be covered by the bank's device and communication controls.
- Keep “Draft”, “Reviewed” and “Copied” separate from a manually recorded actual contact. Copying does not establish delivery, identity verification or customer consent.

The limits on model privileges, untrusted inputs and output handling follow the threat model described in [OWASP's prompt-injection guidance](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). Templates reduce this feature's generative exposure; they do not secure the rest of the app.

**Storage and production boundary**

The inspected Vigía records are plaintext; signed exports detect changes but do not conceal their contents. Therefore all cases, drafts, screenshots and exports in this demonstration must remain synthetic. Authentication, case-level authorization, encrypted storage/exports and secure key management have not been established by this planning review.

For a real pilot, first define which system owns the communication record. Retain only the necessary reviewed version and metadata under the bank's retention rules; avoid a parallel archive of prompts and draft variants. A retention policy must also account for applicable banking preservation duties and data-subject rights.

The bank should review access separation, recipient verification, encryption and key custody, logging, retention, incident response, third-party dependencies and any cross-border data flow before real records enter the system. SBP's technology-risk agreement calls for application/equipment risk assessment, access controls and vulnerability testing. [Agreement 3-2012, articles 3–4 and 11](https://www.superbancos.gob.pa/documentos/leyes_y_regulaciones/acuerdos/2012/Acuerdo_3-2012.pdf)

Use “synthetic demonstration with controls designed to limit data exposure” in the submission. Do not claim “Law 81 compliant”, “bank-approved” or “secure because offline” without an assessment of the actual deployment.

**Timebox and acceptance**

Allocate at most 60–90 minutes within the existing case-UI block, replacing a new automatic checklist. Start with one short-message template. Add email and conversation formats only if they reuse the same controlled facts without delaying core evaluation.

Check that missing route/document information prevents a ready draft; unsupported steps cannot populate it; no internal notes or executable content appear; copying never marks contact complete; and the synthetic reviewed wording survives case reload/export. A change to its underlying case facts invalidates the earlier review.

The five-minute video keeps 40 seconds for this feature. Demonstrate the reviewed next step becoming a clear draft and being saved as “prepared”. No actual customer contact takes place.

This is a product and public-source assessment, not a production compliance determination. No feature implementation or external communication has been performed.
