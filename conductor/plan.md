# Plan: Athena Architecture Safety, Dual-Data & Dock UI Refactor

## Background & Motivation
1. **Dual-Data Confusion:** De MediaMapper toont zowel de losse sectie-JSON's als de geaggregeerde `all_data.json`. Dit is verwarrend en leidt tot inconsistente data als gebruikers direct `all_data.json` proberen aan te passen.
2. **Workflow Contaminatie (Kritiek):** De monorepo `athena-x` (ontwikkeling) overschrijft momenteel de sites in de `athena-cms-factory` (productie) organisatie via GitHub Actions.
3. **Ontwikkelings- & Productie Lifecycle:** Bij het doorzetten van nieuwe code van `athena-x` naar de productie-monorepo `athena`, mag de workflow niet "vast" staan op de ontwikkel-organisatie. De workflow moet dynamisch het juiste doel kiezen afhankelijk van waar hij draait.
4. **Nood-Backup & Structurele Backups:** De huidige sites moeten vanuit `ath-x` veiliggesteld worden naar een `bUP` organisatie. In de toekomst moet dit een gestandaardiseerd proces worden van `athena-cms-factory` naar `bUP`.
5. **Dock UI / UX:** De Dock interface heeft een onhandige lay-out (twee zijbalken) en mist functies (hero slider, werkende delete-knop voor items).

## Proposed Solution

### Phase 1: Emergency Backup & Dynamische Workflow Fix (Highest Priority)
1. **Nood-Backup Uitvoeren:** Een geautomatiseerd bash script draaien (via `gh` CLI) dat:
   - Alle repositories in de organisatie `ath-x` ophaalt.
   - Deze als een exacte kopie (`--mirror`) pusht naar de organisatie `bUP`.
2. **Dynamische Workflow Redirect:** De GitHub Action workflow (`.github/workflows/athena-publisher.yml`) aanpassen zodat hij de doel-organisatie bepaalt op basis van de repository waarin hij draait:
   ```bash
   # In athena-publisher.yml:
   if [ "${{ github.repository }}" == "KarelTestSpecial/athena-x" ]; then
     TARGET_ORG="ath-x"
   else
     TARGET_ORG="athena-cms-factory"
   fi
   TARGET_REPO="$TARGET_ORG/$SITE"
   ```
   *Impact:* Dit garandeert dat `athena-x` áltijd naar `ath-x` pusht, en wanneer deze code naar de productie `athena` monorepo gaat, pusht die automatisch naar `athena-cms-factory` zonder dat we scripts hoeven aan te passen.
3. **Structureel Protocol:** Een script (`factory/6-utilities/backup-to-bup.sh`) schrijven dat dient als de officiële procedure om in de toekomst `athena-cms-factory` naar `bUP` te back-uppen.

### Phase 2: Dual-Data Anchoring & MediaMapper Fix
1. **Architectuur Keuze:** De afzonderlijke sectie JSON-bestanden blijven de basis (Source of Truth) vanwege de 1-op-1 Google Sheets mapping.
2. **MediaMapper Filter:** `all_data.json` uitsluiten van weergave in de MediaMapper (en andere UI tools), zodat bewerkingen uitsluitend op sectie-niveau gebeuren.
3. **Auto-Aggregator:** De bestaande aggregatie logica lostrekken in een centrale `data-aggregator.js` en deze integreren in de `vite-plugin-athena-editor.js` zodat ná elke wijziging (via de tools) `all_data.json` direct en automatisch wordt overschreven.

### Phase 3: Athena Dock UI Refactor & Bug Fixes
1. **API Herstel:** `sites/athena-hub/vite.config.js` (en de standaard plugin) updaten zodat functies zoals `action: 'delete'` goed werken én de nieuwe aggregator aanroepen.
2. **UI Refactor:** 
   - Rechterzijbalk verwijderen in `DockFrame.jsx` voor meer visuele rust.
   - Modals implementeren voor ruimtevragende zaken: Sectie-beheer (reorder/toggle), Layout Settings, Fields, en Items.
   - "Old school" UI styling in de overgebleven linkerbalk (met accordions).
   - Alle ontbrekende Hero Styling Tools (zoals transparantie slider, uitlijning, knop-stijlen, etc.) volledig herstellen en integreren in het nieuwe accordeon ontwerp.

## Verification & Testing
- Workflow testen: commit maken in `athena-x` en verifiëren in de logs dat de target `ath-x` is gekozen.
- Nood-backup testen: verifiëren dat `bUP` organisatie gevuld is.
- Test de MediaMapper: controleren of `all_data.json` verborgen is.
- Test de Dock: Verwijder een showcase item in `athena-hub` en verifieer in de `all_data.json` file dat het onmiddellijk is bijgewerkt.