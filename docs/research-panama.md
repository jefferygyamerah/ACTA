# Panama evidence and competitive check

**ACTA: Panama evidence and competitive check**

Research checked: 10 September 2026. Scope: public evidence about internal banking procedure assistance, account-opening documentation, incomplete-case review and handoff. This is desk research; no bank staff were interviewed and no competitor product was tested.

**Recommendation**

Continue with the bank submission. The broader operational pain is grounded in local primary sources, and a close internal document assistant has already been reported in Panama. Present ACTA as a focused prototype for preparing incomplete cases for human review. Its value still needs to be demonstrated against the bank's existing workflow.

The strongest defensible problem statement is: “When a customer request cannot be completed, staff need a clear, source-backed explanation of what is missing and a review record the next person can use.”

Account opening remains the simplest demonstration because the existing ACTA fixtures already support it. Customer-data updates are a plausible later extension, not additional hackathon scope.

**What already exists**

| Existing offering | Evidence and overlap | Implication |
|---|---|---|
| IVCISA DocuAssist | The vendor reports an internal assistant at an unnamed private Panamanian bank, using Amazon Q Business/Q Apps with Teams and SharePoint. It addresses scattered manuals, recurring questions and document versions. The report provides no quantified ROI or independent verification. | Generic document chat has a close local precedent. Existing workplace integration and source synchronization are meaningful competitive strengths. [Vendor case study](https://ivcisa.com/index.php/amazon-q-transformando-la-gestion-documental-en-la-banca-panamena/) |
| Caja de Ahorros A.N.D.R.E.A. | Caja's customer-facing assistant already covers product requirements and tracks certain loan/card applications, alongside other services. | A requirements chatbot would overlap with the sponsor's existing offering. Public information does not reveal Caja's full internal toolset. [Official service page](https://www.cajadeahorros.com.pa/andrea/) |
| Caja's digital account products | Caja advertises digital account options. Its “Caja en línea” account specifically requires an existing active individual account; this condition should not be generalized to every digital product. | Routine digital opening is an existing alternative. Focus discovery on cases that need staff intervention. [Account catalogue](https://www.cajadeahorros.com.pa/cuentas/), [Caja en línea requirements](https://www.cajadeahorros.com.pa/ahorro-cuenta-caja-en-linea/) |

A further analogous case from Rootstack describes an internal banking CRM assistant that guides employees through case registration. The bank and deployment country are undisclosed, so it is not counted as a verified Panama deployment. [Rootstack's account published by CAPATEC](https://capatec.org.pa/agentes-de-ia-en-banca-lecciones-de-una-implementacion-real/)

The search did not establish a publicly documented product with exactly ACTA's proposed combination of local inference, constrained procedure selection and a persistent review record. That does not establish uniqueness: bank systems are often private, and feature combinations alone are readily imitated.

**Evidence that the pain is real**

The strongest source is the SBP's “Resultados 2025” presentation, dated 25 February 2026. Page 23 describes its six-bank pilot and diagnoses inconsistent interpretations, customer-update process gaps, weak understanding of segmentation, and inadequate internal communication. The participating banks listed do not include Caja. This supports the sector-level problem; it provides no Caja-specific frequency or measured benefit for ACTA. [SBP presentation, page 23](https://www.superbancos.gob.pa/documentos/asunt_proy_int/Resultado2025.pdf#page=23)

The regulator's annual report also attributes some practices affecting customer experience to internal bank policies. A source-following assistant can help staff apply an approved process consistently, but cannot repair an unnecessarily burdensome policy merely by repeating it accurately. [SBP annual report, printed page 31](https://www.superbancos.gob.pa/documentos/institucional/IA25/Memoria-2025.pdf)

Caja's public regular-account requirements vary by applicant profile and allow additional information requests. That demonstrates procedural branching, not how often staff make errors or customers return with missing documents. [Caja regular-account requirements](https://www.cajadeahorros.com.pa/ahorro-cuenta-regular/)

The SBP reported pilot results in June 2025 and described work on onboarding, customer updates and simplified-account thresholds. Treat the evidence as a documented problem being addressed, not proof that every earlier difficulty remains unchanged today. [SBP pilot results, 18 June 2025](https://www.superbancos.gob.pa/node/1490)

**Confidence and limits**

| Proposition | Assessment |
|---|---|
| Panama has documented onboarding and customer-update friction | Strong public evidence from the regulator. |
| Internal document lookup can be a banking pain point locally | Credible vendor-reported case; magnitude unverified. |
| Caja has frequent incomplete cases that lose context at handoff | Plausible hypothesis, still unvalidated with Caja staff. |
| ACTA would reduce rework or handling time | Unproven until compared with a baseline. |
| Poor branch connectivity is a common cause | Not established by this research. |
| Local inference is commercially preferable for this workflow | Depends on bank priorities, integration costs and measured performance. |
| ACTA is the first such product in Panama | Unsupported. |

Local execution is useful to demonstrate for this challenge. Show the actual network boundary and continued operation after disconnection. Keep the commercial claim narrow: inferencing and review can remain on a designated device. The research does not establish a blanket prohibition on cloud banking tools or prove that offline availability is the bank's largest problem.

**How the finding changes the product**

Keep the existing case journey and make its output the centerpiece. The proposed handoff record should contain:

1. Request type and relevant customer facts from synthetic data.
2. Approved source identifier, version and supporting passage.
3. Required evidence and the specific unresolved item.
4. A human-entered observation, next step and responsible role.
5. Request disposition, such as pending documentation, separate from whether the review record has been closed.

Treat structured disposition, owner and checklist fields as proposed additions; they are not all implemented in the inspected repository. The current case events, citations, observations and export provide a starting point.

Source freshness matters as much as retrieval. Show which guide version was used. A local assistant with an old guide can preserve an obsolete instruction very efficiently. For the prototype, use one clearly dated synthetic guide and expose that limitation; building enterprise synchronization is outside the time budget.

A useful demo tension is a missing document plus an unsupported request to bypass it. Show the cited next step when the guide contains one, and abstention/escalation when it does not. Let the employee record the disposition. Demonstrate that the saved case preserves those facts for the next reviewer.

**Fast validation before expanding scope**

Spend at most 20–30 minutes obtaining one recent, anonymized workflow example from a branch employee and, if available, a supervisor. The user should conduct any outreach; none has been sent.

Ask:

- Describe the last account-opening or customer-update file that came back for correction. What caused the return?
- Where did you look for the applicable rule, and how did you know it was current?
- What did the next reviewer need to ask again?
- Which existing tool records the missing item, source, owner and next action?
- Would this prototype remove a step or add duplicate entry?

A recent concrete example is useful preliminary evidence, not market validation. If existing software already handles the proposed handoff well, concentrate on the proven gap within that workflow. If nobody can identify a recurring gap, describe the entry honestly as an exploratory prototype.

For a subsequent pilot, measure time to prepare a correct review packet, returned-case rate, clarification requests, citation accuracy and unsupported instructions. Compare matched cases with the existing process. Estimate staff time saved as eligible cases multiplied by observed minutes saved, then subtract the extra entry/review effort. Do not invent ROI numbers for the submission.

**Recommended positioning and video opening**

Working positioning:

“ACTA ayuda al colaborador a revisar solicitudes incompletas, consultar el procedimiento aplicable y dejar un expediente claro para la siguiente revisión, con IA ejecutada localmente.”

An evidence-backed opening can state that the SBP has documented interpretation and coordination problems in onboarding and customer updates, then immediately demonstrate one synthetic case. Cite the regulator on screen. Label the bank, guide and customer data as synthetic.

As a judge, I would assess the strongest version on whether the reviewer can understand the case without repeating the investigation, whether every procedural instruction has support, and whether the local workflow actually runs. Novelty of document chat would be a weak central claim.

Related implementation plan: [Bank submission plan](plan.md).


**Current communication scope:** follow [Customer contact, privacy and security](privacy-security.md) for the narrower template-based feature agreed after this research. Product naming and completion status are maintained in [the decision record](decisions.md) and [submission checklist](submission-checklist.md).
