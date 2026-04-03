#!/bin/bash

# 🚀 Athena Site Migration Tool (v1.0)
# Migrates sites from ~/kla to the Active Factory and syncs to GitHub.

SITE_NAME=$1
GH_ORG="athenasitesy"

if [ -z "$SITE_NAME" ]; then
    echo "Usage: ./athena-migrate.sh <site_name>"
    exit 1
fi

SOURCE_PATH="/home/kareltestspecial/kla/sites/$SITE_NAME"
TARGET_PATH="/home/kareltestspecial/0-IT/4-pj/x-v9/athena/sites/$SITE_NAME"

if [ ! -d "$SOURCE_PATH" ]; then
    echo "❌ Error: Source '$SOURCE_PATH' not found."
    exit 1
fi

echo "📦 Migrating '$SITE_NAME' to the Factory..."
mkdir -p "$TARGET_PATH"
rsync -av --exclude 'node_modules' --exclude 'dist' --exclude '.git' "$SOURCE_PATH/" "$TARGET_PATH/"

echo "🏗️  Staging changes in Monorepo..."
git add "sites/$SITE_NAME"
git commit -m "feat: migrate $SITE_NAME from kla to factory"

echo "📤 Pushing to Monorepo (origin)..."
git push origin main

echo "🌿 Performing Subtree Push to $GH_ORG/$SITE_NAME..."
# Check if repo exists, if not create it
if ! gh repo view "$GH_ORG/$SITE_NAME" &>/dev/null; then
    echo "✨ Creating repository $GH_ORG/$SITE_NAME..."
    gh repo create "$GH_ORG/$SITE_NAME" --public --description "Athena Site: $SITE_NAME"
fi

git subtree push --prefix "sites/$SITE_NAME" "git@github-athena:$GH_ORG/$SITE_NAME.git" main

echo "✅ Migration and Sync complete for '$SITE_NAME'."
