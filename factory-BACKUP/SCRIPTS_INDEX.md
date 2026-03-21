# 🗂️ Athena CMS - Scripts Index (v8.8)

Dit document biedt een overzicht van de belangrijkste scripts in de Athena CMS Factory. Gebruik dit als referentie voor het automatiseren van taken en het begrijpen van de systeemarchitectuur.

## ⚙️ Engine (`factory/5-engine/`)
De kern van de fabriek, verantwoordelijk voor data-verwerking, generatie en procesbeheer.

### Core Controllers (`/controllers`)
- **SiteController.js**: Beheert de levenscyclus van sites (creëren, deployen, previewen).
- **SystemController.js**: Systeem-brede operaties (logging, secrets, OCI hunt).
- **ProjectController.js**: Beheer van projectdata en configuratie.
- **GithubController.js**: Integreert met GitHub voor safe-pull en repository beheer.

### Data & Sync (`/lib` & `/core`)
- **DataManager.js**: Dé centrale hub voor alle data-operaties (JSON, TSV, Google Sheets).
- **Gateway.js**: Beheert de in- en uitgaande data-stromen (Cloud Pull/Push).
- **factory.js**: De motor achter de site-generatie op basis van blueprints.
- **ProcessManager.js**: Beheert de PM2 processen en poorttoewijzingen.

## 🛠️ Utilities (`factory/6-utilities/`)
Scripts voor batch-verwerking, onderhoud en specifieke migraties.

### Batch Updates
- **update-all-sites.js**: Voert systeem-brede updates uit op alle gegenereerde sites.
- **update-all-heros.js / headers.js / logos.js**: Specifieke batch-updates voor componenten.
- **batch-upgrade-components.js**: Moderniseert alle sitetypes en sites door `<Editable*>` wrappers te vervangen door native v8.8 HTML met `data-dock-*` attributen.
- **update-all-connectors.js**: Rolt de Master `dock-connector.js` uit naar alle sites voor uniforme Dock-communicatie.

### Audit & Debugging
- **check-sites.sh**: Snel overzicht van de status van alle sites.
- **bulk-site-audit.js**: Genereert een gedetailleerd auditrapport van het portfolio.
- **check-missing-images.js**: Spoort ontbrekende media-assets op.

### Migratie & Tools
- **sync-to-prod.sh**: Automatiseert de overgang van `athena-x` naar `athena`.
- **export-site-to-sheets.js**: Exporteert lokale JSON data naar een nieuwe Google Sheet.
- **simulate-customers.js**: Genereert gesimuleerde klantverzoeken voor testing.

## 🛡️ Safety & Backup (`factory/6-utilities/`)
- **backup-org.sh**: Spiegelt alle repositories van de ene GitHub organisatie naar de andere. Ondersteunt `--update` flag voor volledige verversing en standaard 'skip' modus voor snelle hervatting.
  > **💡 Best Practice:** Voer dit script uit in een **apart terminalvenster** om onderbrekingen door AI-sessie timeouts te voorkomen bij grote organisaties.
- **major-milestone-sync.sh**: Automatiseert het maken van een nieuwe MAJOR MILESTONE, het afzwakken van de vorige, het verplaatsen van tags en het synchroniseren van Dev naar Productie.

---

*Update dit document bij het toevoegen van nieuwe belangrijke scripts.*
