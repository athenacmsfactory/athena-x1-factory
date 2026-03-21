# ✅ DONE - Athena CMS Factory

## [2026-03-20] v8.8.5 - Component Interaction & Sheet Manager Recovery
- [x] **Athena Hub Header Fix**: "Start Nu" knop correct gekoppeld aan de Contact sectie (was hardcoded naar showcase).
- [x] **Universal Email Detection**: `DefaultSection.jsx` uitgebreid met automatische `mailto:` link detectie voor e-mailadressen.
- [x] **Engine Method Refactor**: `syncFromSheet` en `syncToSheet` hernoemd naar `pullFromSheet` en `pushToSheet` in `DataManager.js` voor betere intuïtie.
- [x] **Hero Resilience**: `HeroSection.jsx` aangepast om expliciet lege titels/ondertitels uit de data te respecteren (voorkomt ongewenste fallbacks).
- [x] **Showcase Link Recovery**: Herstel van verloren project-links in `showcase.json` en `links_config.json` na herhaalde push/pull cycli.
- [x] **Sheet Manager Backend Recovery**: Ontbrekende `getSiteStructure` en `linkSheet` methodes geïmplementeerd in `SiteController.js`.
- [x] **API Route Alignment**: Route `/api/sites/:id/link-sheet` toegevoegd aan `server.js` voor compatibiliteit met de frontend.
- [x] **Dynamic Sheet Loading**: `SheetModal.jsx` in de dashboard-ui aangepast om actief de actuele Sheet URL op te halen bij het openen.
- [x] **Sheet Manager Button Activation**: Fix voor verduisterde (disabled) Push/Pull knoppen door ze te koppelen aan de lokale `sheetUrl` state.
- [x] **Frontend Service Expansion**: `ApiService.js` uitgebreid met `getSiteStructure` methode.
- [x] **Production Build Validation**: Volledige herbuild van de Dashboard UI (`pnpm run build`) en herstart via PM2 succesvol uitgevoerd.

## [2026-03-17] v8.8.0 - Chromebook Optimization & Unified Hub
- [x] **Unified Preview Proxy**: Implementatie van `http-proxy-middleware` in de API voor centrale site-access.
- [x] **Dynamic Port Registry**: Synchronisatie tussen Dock, Factory en centraal Port Manager register voltooid.
- [x] **CPU Stress Fix**: Caching van `df -h` en `du -sm` aanroepen in de backend (300% -> <1% load).
- [x] **Universal Site Patch**: Alle 45+ sites geüpdatet met `allowedHosts`, `cors: true` en `process.env.PORT`.
- [x] **Athenification**: `academy-1`, `bakkerij-de-graankorrel` en `de-stijlvolle-kapper` gepromoveerd naar Native.
- [x] **Copyright Renaming**: Volledige sanitatie van `dirk-de-witte-kappers` naar `de-stijlvolle-kapper`.
- [x] **GitHub Tab Fix**: Foutafhandeling toegevoegd aan repository-listing; UI crash verholpen.
- [x] **Live Counter Fix**: Dashboard tellers gesynchroniseerd met werkelijke `deployment.json` data.

## [2026-03-08] v8.0.7 - Component Excellence Upgrade
- [x] **EditableText & EditableLink Upgrade (v8.4.2)**: Uitgebreide styling (Font Family, Shadows, Padding) toegevoegd en uitgerold naar alle 43 componenten.
- [x] **Ironclad Rendering Safety**: Fix voor "Objects as React child" error via geforceerde string-extractie.
- [x] **Memory-State Sync**: Dock updatet nu instant de lokale state na een save (lost race-condities op).
- [x] **Multi-Track Preview System**: Automatische `/preview/` subfolder activatie op GitHub Pages.
- [x] **Batch Upgrade Utility**: `batch-upgrade-components.js` aangemaakt voor multi-component portfolio onderhoud.
- [x] **Human-Readable Standard**: `GEMINI.md` uitgebreid met Nederlandstalige veldnamen-regel.
- [x] **Site Localization**: De Schaar volledig omgezet naar Nederlandstalige JSON keys.

## [2026-03-18] v8.8.4 - System-Wide Modernization & Standardisation
- [x] **v8.8 Shift+Click Standard**: Migratie van alle 48 sites naar native HTML componenten voor betere betrouwbaarheid.
- [x] **Universal Dock Connector**: Robuuste `dock-connector.js` die zowel JSON als dot-notation bindings ondersteunt.
- [x] **Sync-to-Prod Script**: Automatisering van de overgang van ontwikkeling (`athena-x`) naar productie (`athena`).
- [x] **Scripts Index**: Centrale referentie voor alle fabriekstools in `factory/SCRIPTS_INDEX.md`.
- [x] **Dock Frame Recovery**: Herstel van crashes bij object-gebaseerde site-instellingen.
- [x] **Critical Site Restoration**: Handmatige reparatie en optimalisatie van `athena-hub` en `athena-pro`.
- [x] **Syntax Recovery Sweep**: Geautomatiseerde herstelronde voor JSX-fouten in 140+ bestanden.

## [2026-03-06] v8.0.6 - Design Controls & Text Styling (v8.3)
- [x] **Header Transparency Slider**: Traploze transparantie slider (0-100%).
- [x] **Dynamic Header Logic**: Automatische RGBA berekening en border-verwijdering.
- [x] **Fixed Header Height Interaction**: Verbeterde state-lock op de slider.
- [x] **Individual Text Styling**: Color picker, fontSize, fontWeight, alignment en italic support per element.
- [x] **Footer Editability**: Statische footer-teksten omgezet naar `EditableText`.
- [x] **Theme Swapping via Dropdown**: Nieuwe selector interface in de Dock.
- [x] **Improved Dock-Connector**: Live injectie van complexe tekst-objecten in preview.

## [2026-03-02] v8.0.5 - Site Reviewer & Stability Engine
- [x] **Athena Site Reviewer**: Interactieve reviewer op poort 5001.
- [x] **EPIPE Immunity**: Fix voor dashboard-server crashes.
- [x] **Smart Resource Management**: Proactief opschonen van oude preview-servers.
- [x] **Forced Linux Environment**: Geoptimaliseerde Chrome launcher voor Chromebooks.
- [x] **Bulk Audit Utility**: `bulk-site-audit.js` voor technische scans.

... rest of history ...
