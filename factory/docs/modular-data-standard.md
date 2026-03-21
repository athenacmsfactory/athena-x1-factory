# Modular Data & Hybrid Site Standard (v8.8)

## Overzicht
Athena CMS v8.8 introduceert een strikte scheiding tussen content/configuratie en een hybride beheer van native en externe websites binnen de monorepo.

## De 1-op-1 Regel (Data)
Elke UI-sectie op de website correspondeert met exact één JSON-bestand en één tabblad in de Sheet.

### 1. Content Tabbladen (Zichtbaar)
Tabbladen die direct door de klant bewerkt mogen worden hebben een schone, Nederlandstalige naam (bijv. `header`, `hero`, `voordelen`, `footer`).

### 2. Config Tabbladen (Verborgen)
Technische configuratiebestanden krijgen een underscore (`_`) prefix (bijv. `_site_settings`, `_section_order`). De Factory verbergt deze automatisch in de klant-interface.

## Hybride Site Architectuur
De monorepo ondersteunt twee typen projecten voor optimale flexibiliteit:

### 1. Athena Native Sites (`sites/`)
- **Functionaliteit**: Volledige v33 Sync Bridge en Dock ondersteuning.
- **Port Management**: Hebben een unieke poort (5100-6999) via de `port-manager`.
- **Preview**: De Reviewer UI start automatisch een `pnpm dev` ontwikkelserver op.

### 2. Externe / Statische Sites (`sites-external/`)
- **Functionaliteit**: Alleen statische weergave (View-only).
- **Hosting**: Worden geserveerd door de Athena API (poort 5000) via `/sites-external/<id>/`.
- **Preview**: De Reviewer UI herkent de `isExternal` vlag en laadt de site direct in zonder wachttijd.

## SmartIcon Systeem
De `GenericSection` rendert intelligent iconen uit de Sheet:
- **SVG Pad**: Begint de cel met `M`, dan wordt dit als inline SVG gerenderd.
- **FontAwesome**: Bevat de cel een FA-klasse (bijv. `fa-star`), dan wordt het FA-icoon getoond.
