# Plan: v8.8 Dock Standardization & Component Modernization

## Objective
Het elimineren van de "Generatiekloof" binnen de Athena Factory door alle gegenereerde sites te upgraden naar de nieuwe v8.8 standaard. Dit betekent het verwijderen van logge wrapper-componenten en het standaardiseren van de communicatie tussen de sites en de Dock Editor.

## Background & Motivation
Tijdens de site-audit werd vastgesteld dat oudere sites (zoals `athena-promo`) niet correct functioneren in de Reviewer (knoppen werken niet, Shift+Click faalt). Dit wordt veroorzaakt door:
1. Verouderde `dock-connector.js` scripts in de sites die stricte JSON verwachten in `data-dock-bind`.
2. Het gebruik van `<EditableLink>` en `<EditableText>` componenten die events kapen (`e.preventDefault()`) en botsen met iframe/CORS restricties.
Nieuwere sites (zoals `academy-1`) gebruiken native HTML met simpele string-bindings en werken foutloos. Omdat we in de opstartfase zitten, is een system-wide refactor de beste aanpak.

## Implementation Steps

### 1. Master Connector Synchronisatie
- Zorg dat `factory/5-engine/dock-connector.js` de meest robuuste logica bevat (ondersteuning voor string-bindings via punt-notatie én oude JSON fallbacks voor de zekerheid).
- Gebruik een utility script (bijv. `factory/6-utilities/update-all-connectors.js`) om deze master file naar de `public/` (of `src/`) mappen van **alle 48 sites** in `sites/` te forceren.

### 2. Batch Component Refactoring
We schrijven/gebruiken een AST of Regex gebaseerd script (`factory/6-utilities/batch-upgrade-components.js`) dat door alle `src/components/` van de sites itereert en:
- `<EditableText>` vervangt door native tags (zoals `<span>`, `<h1>`) met `data-dock-type="text"`.
- `<EditableLink>` vervangt door `<button>` of `<a>` met de nieuwe `Shift+Click` standaard.
- `<EditableMedia>` vervangt door `<img>` met `data-dock-type="media"`.
- De `data-dock-bind` syntax omzet van objecten/attributen naar simpele strings (bijv. `${sectionName}.0.titel`).

### 3. Cleanup
Verwijder de ongebruikte `Editable*.jsx` bestanden uit de sites om de codebase schoon te houden.

## Verification
- Herstart de Reviewer (`ath-stop && ath-x`).
- Test een oude site (zoals `athena-promo`) en een nieuwe site (`academy-1`).
- Beide moeten naadloos navigeren bij een normale klik en de Dock Editor triggeren bij een Shift+Klik.