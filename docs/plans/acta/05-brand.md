# Caja de Ahorros website extraction for ACTA

Observed September 10, 2026. This is an extraction of the bank's public website implementation, not an official brand manual.

Sources:
- https://www.cajadeahorros.com.pa/
- https://www.cajadeahorros.com.pa/wp-content/themes/cajadeahorros/style.css?ver=1.0.0
- https://www.cajadeahorros.com.pa/wp-content/themes/cajadeahorros/assets/images/logo_icon.svg

| ACTA token | Value | Observed source |
|---|---|---|
| primary | #005199 | .btn-primary background; logo_icon.svg fill |
| primary-hover | #1370C2 | .btn-primary:hover / :active |
| ink | #07355E | .navbar-nav > li > a |
| muted | #506578 | a.toggleSearchBtn text |
| surface-soft | #F5F8FB | header .search-form background |
| border | #BAD0E3 | header .search-form border |
| surface | #FFFFFF | white surfaces and white logo fill |
| font | Poppins, sans-serif | body and @font-face |
| control-radius | 8px | accordion summary; ACTA adapts this to controls |

The primary color in bundled Bootstrap CSS (#0d6efd) is a framework default, not the bank-specific button/logo value. Elementor also carries defaults; prefer identified site-specific selectors and actual assets.

Use brand-tokens.css as the named-token source. No remote font import is included: keep the system fallback until a licensed local Poppins asset is provided, then retain its licence and test offline rendering. No bank logo or font binary is bundled. If a sponsor logo is needed, use its official unchanged asset with clear challenge context, while ACTA retains its own wordmark.

Before claiming a match, render the actual ACTA surface and inspect contrast, keyboard focus, long citations, pending/error states, loading feedback and the five-minute recording viewport. Additional status colors must be documented as ACTA UI choices, not extracted bank brand colors.

