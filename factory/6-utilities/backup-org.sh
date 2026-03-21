#!/bin/bash
# Script to mirror backup all repositories from one GitHub organization to another
# v8.4 - Flex-Mode (Skip or Update)
# 
# Usage: ./backup-org.sh <source> <dest> [--update]
# Standard behavior: Skip repositories that already exist in destination (emergency/resume mode).
# --update flag: Refresh all repositories by performing a full mirror push (regular backup mode).

SRC_ORG=$1
DEST_ORG=$2
UPDATE_MODE=false

# Check for update flag
if [[ "$3" == "--update" ]] || [[ "$1" == "--update" ]]; then
  UPDATE_MODE=true
  if [[ "$1" == "--update" ]]; then SRC_ORG=$2; DEST_ORG=$3; fi
fi

if [ -z "$SRC_ORG" ] || [ -z "$DEST_ORG" ]; then
  echo "Usage: $0 <source_organization> <destination_organization> [--update]"
  echo "  --update: Refresh existing repositories (standard mirror)"
  echo "  (default: skip repositories that already exist in destination)"
  exit 1
fi

TOKEN=$(gh auth token)
BACKUP_DIR=$(mktemp -d -t "athena-backup-XXXXXXX")

# Optimize Git for large transfers
git config --global http.postBuffer 524288000

echo "=================================================="
echo "🚀 Athena GitHub Backup Tool v8.4"
echo "📦 Source: $SRC_ORG"
echo "🗄️  Destination: $DEST_ORG"
echo "🔄 Mode: $([ "$UPDATE_MODE" = true ] && echo "Update/Mirror All" || echo "Skip Existing (Resume)")"
echo "=================================================="

echo "🔍 Fetching source repository list..."
SRC_REPOS=$(gh repo list "$SRC_ORG" --limit 1000 --json name -q '.[].name')

if [ "$UPDATE_MODE" = false ]; then
  echo "🔍 Fetching destination repository list..."
  DEST_REPOS=$(gh repo list "$DEST_ORG" --limit 1000 --json name -q '.[].name')
fi

cd "$BACKUP_DIR"

for REPO in $SRC_REPOS; do
  if [ "$UPDATE_MODE" = false ]; then
    if echo "$DEST_REPOS" | grep -q "^$REPO$"; then
      echo "⏭️  Skipping $REPO (already exists)"
      continue
    fi
  fi

  echo "--------------------------------------------------"
  echo "🔄 Processing: $REPO"
  
  # 1. Clone bare
  if ! git clone --bare "https://x-access-token:${TOKEN}@github.com/$SRC_ORG/$REPO.git" "$REPO.git"; then
    echo "⚠️ Clone failed. Skipping..."
    continue
  fi
  
  cd "$REPO.git"
  
  # 2. Create if missing
  gh repo view "$DEST_ORG/$REPO" >/dev/null 2>&1 || gh repo create "$DEST_ORG/$REPO" --private --description "Backup of $SRC_ORG/$REPO"
  
  # 3. Mirror Push
  echo "📤 Pushing mirror..."
  if git push --mirror "https://x-access-token:${TOKEN}@github.com/$DEST_ORG/$REPO.git"; then
     echo "✅ $REPO successfully backed up."
  else
     echo "❌ Push failed for $REPO"
  fi
  
  cd ..
  rm -rf "$REPO.git"
done

rm -rf "$BACKUP_DIR"
echo "=================================================="
echo "🎉 Backup process completed!"
echo "=================================================="
