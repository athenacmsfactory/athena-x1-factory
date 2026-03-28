# 🧱 Lego Factory v9.0 - Developer Guide

Welkom bij de v9.0 "Lego Edition" engine. Dit systeem is ontworpen voor maximale modulariteit, snelheid en directe integratie met de Athena Dock.

## 🚀 Snelstart: Een nieuwe site maken

Je kunt een site maken via de CLI (aanbevolen voor developers) of via de Dashboard UI.

### Methode A: Via de CLI (Local-First)
Draai het volgende vanuit de `factory` map:
```bash
pnpm lego <mijn-project-naam>
```
*Omdat je geen spreadsheet-id opgeeft, gebruikt de engine automatisch de **Seed Data** uit de bibliotheek. Je hebt dus direct een werkende site zonder cloud setup.*

### Methode B: Met Google Sheets
```bash
pnpm lego <mijn-project-naam> <spreadsheet-id>
```

---

## 🛠️ De "Local-First" Workflow

In v9.0 adviseren we deze volgorde:

1.  **Genereren**: Draai `pnpm lego mijn-site` zonder ID.
2.  **Ontwikkelen**: Start de site en bewerk hem visueel in de Dock (Shift+Click). Je wijzigingen worden lokaal in `src/data/*.json` opgeslagen.
3.  **Koppelen**: Pas als je klaar bent, maak je een Google Sheet aan en koppel je deze via de Dashboard instellingen.
4.  **Sync**: Gebruik de Dock om je lokale data naar de Google Sheet te "pushen".

---

## 🏗️ Het Bouwproces (Onder de motorkap)

Wanneer je een site genereert, voert de `ProjectGenerator` de volgende fases uit:

1.  **Initialize**: Maakt de mappenstructuur aan in `sites/<naam>`.
2.  **Data**: Haalt data op uit Google Sheets (1-op-1 regel). Elke tab wordt een `.json` bestand in `src/data/`.
3.  **Template**: Kopieert de Vite/React boilerplate.
4.  **Component**: 
    *   Kopieert de gekozen Header, Footer en Hero uit de `9-library`.
    *   Genereert een dynamische `Section.jsx` die alle andere secties importeert.
    *   **Automagische Dock-integratie**: Elke sectie wordt gewrapt in een `div` met `data-dock-section`.
5.  **Finalize**: Consolideert alle data in `all_data.json` en bereidt de `package.json` voor.

---

## ⚓ Dock Protocol v9.0

In v9.0 hoef je geen ingewikkelde JSON-strings meer te schrijven in je HTML. We gebruiken het "Dot Protocol":

### Tekst Binding
```jsx
<h1 data-dock-bind="hero.0.titel">{data.titel}</h1>
```

### Media Binding
```jsx
<img src={data.afbeelding} data-dock-bind="hero.0.afbeelding" data-dock-type="media" />
```

### Waarom werkt dit?
De `DockConnector.jsx` bridge in je site luistert naar deze attributen. Wanneer je **Shift + Click** op een element met `data-dock-bind` drukt, opent de Dock direct de juiste editor.

---

## 🛠️ Een nieuwe Lego-blok toevoegen

Wil je een nieuwe sectie maken voor de bibliotheek?

1. Maak een nieuw bestand in `factory/9-library/sections/MijnNieuweSectie.jsx`.
2. Gebruik de `sectionName` prop voor dynamische binding:
```jsx
function MijnNieuweSectie({ data, sectionName }) {
  return (
    <section id={sectionName} className="py-20">
       <h2 data-dock-bind={`${sectionName}.0.titel`}>{data?.[0]?.titel}</h2>
    </section>
  );
}
```
3. Registreer de blok in `factory/9-engine/lib/LegoRegistry.js`.

---

## 📂 Bestandsstructuur Site
```text
sites/<project>/
├── src/
│   ├── components/
│   │   ├── DockConnector.jsx  # De v9.0 Bridge
│   │   ├── Section.jsx        # De automatische orchestrator
│   │   └── ... (Lego blokken)
│   ├── data/
│   │   ├── all_data.json      # Performance aggregator
│   │   └── ... (losse JSONs)
│   └── App.jsx                # Root component met Bridge
├── athena-config.json         # Metadata voor de Factory
└── package.json
```
