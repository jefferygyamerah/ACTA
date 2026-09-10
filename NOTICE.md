# Provenance and attribution

ACTA is a separate banking submission. This initial repository contains planning and research documentation; it does not yet include application source copied from the referenced projects.

## Vigía

Reference: [cpu-16/vigia](https://github.com/cpu-16/vigia).

**Authorship:** Vigía was developed by Jeffery Gyamerah's hackathon teammate. ACTA's planned reuse builds on that teammate's work, including the banking module already present in Vigía. Credit that origin explicitly in the README, submission and demonstration, and distinguish it from adaptations subsequently made in ACTA.

The implementation plan was based on inspection of commit `942b94307265f383ac941141a6a503e69ebcd079`, particularly `src/sucursal/`, shared runtime/event/signature components, banking fixtures and banking UI files.

The upstream banking module was already present; it must not be presented as newly invented or wholly authored by ACTA. When importing files, preserve their license, copyright notices and contributor attribution. The earlier inspection identified an MIT license; verify the exact notice at the imported revision.

Previously reported performance and evaluation figures are upstream evidence, not tests executed in ACTA.

## Notare

Reference: [jefferygyamerah/notare](https://github.com/jefferygyamerah/notare).

The plan borrows the interaction principles of adjacent source evidence, correction and deliberate review. No patient/encounter state or encryption implementation has been imported. Check and preserve the relevant license if code is later reused.

## Planning method

Reference: [UditAkhourii/adhd](https://github.com/UditAkhourii/adhd).

The repository's ADHD ideation workflow informed an earlier exploration of hackathon options at the user's request. ACTA does not include its source or install it as an application dependency.

## External research

Links in [the Panama research](docs/research-panama.md) and [privacy/security assessment](docs/privacy-security.md) identify external evidence. Paraphrases are not bank endorsements or permissions to process bank data. External documents retain their original ownership and terms.

The [MIT license](LICENSE) applies to original ACTA material; it does not relicense third-party source material or bank publications.
