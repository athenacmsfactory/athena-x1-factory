# Athena V10 Factory Structure Analysis (Unified & Flattened)

## 🌟 Introductie
De Athena Factory is volledig gemoderniseerd naar een **100% Unified Architecture** (V10). De verouderde "Dual-Track" (Docked vs. Autonomous) scheiding is over de gehele linie opgeheven. Alle templates, site-types en de generator-engine werken nu volgens een eenduidig, plat en krachtig systeem.

Deze structuur is geoptimaliseerd voor snelheid, maximale herbuikbaarheid (Lego-bricks) en 100% compatibiliteit met de externe Athena Dock.

### 🌳 De Geflatteerde Map-Visualisatie (ASCII - V10)

```text
athena/factory/
├── 2-templates/
│   ├── skeletons/         <-- Unified base projects (MPA, SPA, Webshop)
│   └── components/
│       └── legos/         <-- Centralized "Zero-UI" Brick Library (V10 Standard)
│
├── 3-sitetypes/           <-- Pure Registry: Blueprints & Configs
│   └── unified/           <-- Centralized Track (Standard for all 28+ types)
│       ├── computer-shop/
│       ├── medical/
│       ├── portfolio-kbm/
│       └── [25+ other types...]
│
├── 5-engine/              <-- V10 Site Generation Engine (Path-Aligned)
│   ├── core/              (ProjectGenerator, Factory Orchestration)
│   ├── lib/               (ProcessManager, PortRegistry)
│   └── phases/            (Initialize, Data, Boilerplate, Component, Finalize)
│
├── 6-utilities/           <-- Optimized V10 Management Scripts
│   ├── update-all-sites.js (V10 standard sync)
│   └── [Management tools...]
│
├── athena-api/            <-- Backend API (V10 Root standardized)
├── output/                <-- Centralized Site Generation Output & Logs
├── sites/                 <-- Active Site Instances (100% data-dock-bind compatible)
│
└── deprecated/            <-- Centralized Historical Archive (Clean Root)
    ├── modules/           (Legacy 9-engine, 9-library, sitetypes-tester)
    └── templates/         (Legacy track-based skeletons and Editable* bricks)
```

## 📐 Core Philosophy: Bricks vs. Skeleton

1.  **Skeleton (The Scaffold)**:
    *   Located in `2-templates/skeletons/`.
    *   Provides the technical foundation (Vite, Routing, Logic).
    *   Skeletons are **Pure Viewers**—they contain zero editing UI.

2.  **Bricks (The Content)**:
    *   Located in `2-templates/components/legos/`.
    *   Atomic UI elements (Headers, Heros, Shop-Cards).
    *   Must use **data-dock-bind** for all dynamic content.

3.  **Site-Types (The Blueprint)**:
    *   Located in `3-sitetypes/`.
    *   Pure data collections (JSON blueprints + sitetype-specific Assets/CSS).
    *   Injected into a Skeleton during the generation phase.

---

## 🚀 Rollout Status: 100% Unified (V10)

> [!TIP]
> De **Athena Dashboard** UI is nu gelokaliseerd in `x-v9/control/dashboard/`.
> Gebruik `athena.sh` in de factory root om de unified omgeving te starten.

### 2. "Pure Viewer" Skeletons
*   Alle interne editing UI (zoals `DesignControls` en `SectionToolbar`) is verwijderd uit de templates.
*   De template is een pure "viewer" voor de data. De **Athena Dock** (extern) neemt 100% van de editing-taken op zich.

### 3. "Zero-Root" Lego Library
*   Geen losse JSX-bestanden meer in de `components/` root. 
*   Alles is strikt gecategoriseerd in de `legos/` submap (`Layout`, `Shop`, `Common`).

*   De `5-engine` (Generator) werkt met directe paden naar `skeletons/` en `3-sitetypes/`. 
*   Geen complexe pad-resolutie meer op basis van "strategies".

---

## 📂 Detailoverzicht Lageres

### `2-templates/skeletons/`
De functionele motor. Importeert bricks uit de centrale bibliotheek. Gebruikt `/shared/contexts/` (zoals `StyleContext`) voor systeembrede logica.

### `3-sitetypes/`
De blueprint-definities. Bevat per branche specifieke data-structuren, parsers en demo-content. 

### `5-engine/`
De magie. Verantwoordelijk voor het hydrateren van een skeleton met data van een sitetype en het toevoegen van de juiste Lego-bricks.

### 4. 1-1-1 Hybrid Data Standard
De Athena Factory hanteert een strikte scheiding van data voor maximale bewerkbaarheid door eindgebruikers (via Google Sheets):

*   **1-1-1 Regel**: Één visuele sectie (bijv. Header, Hero, Footer, Producten) = Één JSON-bestand in `src/data/` = Één tabblad in de gekoppelde Google Sheet.
*   **Hybride Aggregatie**: Voor optimale runtime performance worden alle losse JSON's gecombineerd tot `all_data.json`.
*   **Automatisering**: In de `vite.config.js` van elke site zorgt de `athenaAggregatorPlugin` ervoor dat `all_data.json` onmiddellijk wordt herberekend bij elke wijziging in de bronbestanden. Dit garandeert dat de "Gouden Bron" (de losse bestanden) en de "Snelle Bron" (het geaggregeerde bestand) altijd synchroon zijn.

---
*Status: V10.1 Definitive Unified Architecture - April 2026*
*Author: Antigravity AI*
