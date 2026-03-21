#!/bin/bash
# 🚀 Athena CMS - Sync to Production (v8.8)
# Gebruik: ./sync-to-prod.sh [--dry-run]

SOURCE="/home/kareltestspecial/0-IT/2-Productie/athena-x"
TARGET="/home/kareltestspecial/0-IT/2-Productie/athena"
DRY_RUN=$([ "$1" == "--dry-run" ] && echo "--dry-run" || echo "")

echo "🔄 Start Athena Sync naar Productie..."

# Check of TARGET bestaat
if [ ! -d "$TARGET" ]; then
    echo "❌ Fout: Productie map '$TARGET' niet gevonden."
    exit 1
fi

# 1. Code Update (Git)
echo "📦 Engine updaten in productie..."
cd "$TARGET" && git pull origin main
cd "$TARGET/factory" && pnpm install

# 2. Data Sync (rsync)
echo "📂 Sites en Input synchroniseren..."
# We kopiëren sites en input 1-op-1 (zonder --delete voor veiligheid in eerste instantie)
rsync -av $DRY_RUN "$SOURCE/sites/" "$TARGET/sites/"
rsync -av $DRY_RUN "$SOURCE/input/" "$TARGET/input/"

# 3. PM2 Restart
echo "🔱 Athena-Productie herstarten..."
# We voeren ath-stop en ath uit in de context van de productie-omgeving
bash -c "source ~/.bash_aliases && ath-stop && ath"

echo "✅ Sync voltooid!"
