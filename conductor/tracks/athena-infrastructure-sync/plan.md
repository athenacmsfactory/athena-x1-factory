# Plan: Athena Infrastructure & Sync Automation (v8.8)

## Objective
Het stroomlijnen van de overgang tussen `athena-x` (Ontwikkeling) en `athena` (Productie) door middel van een robuust synchronisatiescript en een centrale index van alle beschikbare scripts in de engine en utilities.

## Key Files & Context
- `factory/6-utilities/sync-to-prod.sh`: Het nieuwe automatiseringsscript.
- `factory/SCRIPTS_INDEX.md`: Een door AI leesbare index van alle scripts.
- `athena-x/sites/`: De bron van de gegenereerde sites.
- `athena/sites/`: De bestemming in de productie-omgeving.

## Implementation Steps

### 1. Scripts Index (`factory/SCRIPTS_INDEX.md`)
Dit bestand zal dienen als centrale referentie voor AI en ontwikkelaars.

**Voorgestelde inhoud:**
```markdown
# 🗂️ Athena CMS - Scripts Index (v8.8)

## ⚙️ Engine (factory/5-engine/)
- **SiteController.js**: Beheert de levenscyclus van sites (creëren, deployen, previewen).
- **DataManager.js**: Dé centrale hub voor alle data-operaties (JSON, TSV, Google Sheets).
- **Gateway.js**: Beheert de in- en uitgaande data-stromen (Cloud Pull/Push).
- **ProcessManager.js**: Beheert de PM2 processen en poorttoewijzingen.

## 🛠️ Utilities (factory/6-utilities/)
- **update-all-sites.js**: Voert systeem-brede updates uit op alle gegenereerde sites.
- **sync-to-prod.sh**: Automatiseert de overgang van athena-x naar athena.
- **bulk-site-audit.js**: Genereert een gedetailleerd auditrapport van het portfolio.
```

### 2. Sync to Prod Script (`factory/6-utilities/sync-to-prod.sh`)
Dit Bash-script automatiseert de promotie van code en data naar de productie-omgeving.

**Voorgestelde inhoud:**
```bash
#!/bin/bash
# 🚀 Athena CMS - Sync to Production (v8.8)
# Gebruik: ./sync-to-prod.sh [--dry-run]

SOURCE="/home/kareltestspecial/0-IT/2-Productie/athena-x"
TARGET="/home/kareltestspecial/0-IT/2-Productie/athena"
DRY_RUN=$([ "$1" == "--dry-run" ] && echo "--dry-run" || echo "")

echo "🔄 Start Athena Sync naar Productie..."

# 1. Code Update (Git)
echo "📦 Engine updaten in productie..."
cd "$TARGET" && git pull origin main
cd "$TARGET/factory" && pnpm install

# 2. Data Sync (rsync)
echo "📂 Sites en Input synchroniseren..."
rsync -av $DRY_RUN "$SOURCE/sites/" "$TARGET/sites/"
rsync -av $DRY_RUN "$SOURCE/input/" "$TARGET/input/"

# 3. PM2 Restart
echo "🔱 Athena-Productie herstarten..."
# Gebruik de aliases of directe pm2 commando's
bash -c "source ~/.bash_aliases && ath-stop && ath"

echo "✅ Sync voltooid!"
```

### 3. Alias Update
Voeg de volgende alias toe aan `~/.bash_aliases`:
`alias ath-promote='/home/kareltestspecial/0-IT/2-Productie/athena-x/factory/6-utilities/sync-to-prod.sh'`


## Verification & Testing
- Controleer of `SCRIPTS_INDEX.md` alle belangrijke bestanden bevat.
- Test het `sync-to-prod.sh` script (met `--dry-run` optie voor de rsync stap) om te verifiëren dat paden en acties kloppen.
- Controleer of de productie-API (`ath`) na de sync weer sites ziet.
