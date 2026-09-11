# ACTA

Cada paso, con respaldo.

## User and job

A branch customer-service employee handles an account-opening request whose documents are incomplete or inconsistent. The employee needs one justified request for the remaining information and a case that another colleague can continue when the customer returns.

A supervisor is the recipient of the completed documentary review. The customer is the beneficiary, not the operator of this prototype.

## Concrete example

Lucía supplies a request, a valid fictitious ID and a proof of address. The request says house 14; the proof says house 41. Income support is absent.

The employee uses local QVAC to read the documents, confirms source-linked facts, and reviews the comparison with a synthetic guide. ACTA prepares one request about the address and income support while retaining the ID. The first review is saved.

On the next visit, a corrected address document explicitly replaces the earlier proof and an income document is added. The employee reviews only the new readings, sees the two resolved gaps, and saves a supervisor-ready record in the same case. The earlier review remains available.

## Finished work

A source-linked documentary review containing the remaining request or resolved result, exact approved text, original document identities, policy version, reviewed facts, visit history and a verifiable signed export.

Saving does not open an account, update the CORE, send a message or establish that a customer was contacted.

## Why build this

Panama's regulator has documented opening/update friction and internal-policy inconsistency. Existing enterprise products already cover much of KYC and document reuse. ACTA's narrower local branch workflow is a deployment and usability hypothesis, not a claim that the problem has no competing solutions.

The [market decision](06-market-usecase.md) separates public evidence, competitor coverage and unknowns.

## Scope and constraints

- Synthetic customers and policy only; no Caja internal procedure or official deployment claim.
- Real local QVAC inference, with raw results and review corrections retained.
- Exact source, case and revision checks; explicit approval before durable save.
- Original files, explicit replacement links and retained previous reviews.
- Plaintext local SQLite and local signing key; no production identity or key custody.
- Text PDF, TXT and Markdown intake; no OCR.
- Caja-derived colors and Spanish interface.
- Maximum five-minute hackathon demo.

The [delivery status](00-status.md) owns acceptance results and known limits.
