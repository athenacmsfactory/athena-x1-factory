#!/bin/bash
# Athena Major Milestone Sync (v8.7)
# Usage: ./major-milestone-sync.sh "Title" "Tag"

TITLE=$1
TAG=$2
SEARCH_LIMIT=15

if [ -z "$TITLE" ]; then
  echo "❌ Error: Geen titel opgegeven."
  echo "Gebruik: $0 \"Milestone Titel\" [tag-naam]"
  exit 1
fi

echo "=================================================="
echo "🔱 Starting Major Milestone Sync"
echo "📝 Nieuwe Titel: $TITLE"
echo "🏷️  Nieuwe Tag:   ${TAG:-geen}"
echo "=================================================="

# 1. Commit huidige werk
echo "📦 Committing current work as MAJOR MILESTONE..."
git add .
git commit -m "MAJOR MILESTONE: --- $TITLE ---"

# 2. Zoek de vorige MAJOR MILESTONE (beperkt tot de laatste 15 commits)
echo "🔍 Zoeken naar vorige Major Milestone (limiet: $SEARCH_LIMIT)..."
PREV_MAJOR_SHA=$(git log -n $SEARCH_LIMIT --grep="MAJOR MILESTONE" --format="%H" | sed -n '2p')

if [ ! -z "$PREV_MAJOR_SHA" ]; then
  echo "📉 Vorige Major Milestone gevonden: $PREV_MAJOR_SHA"
  echo "📉 Bezig met afzwakken naar 'Milestone:'..."
  
  # Gebruik een tijdelijke branch voor de rebase om veilig te werken
  FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --msg-filter "
    if [ \"\$GIT_COMMIT\" = \"$PREV_MAJOR_SHA\" ]; then
      sed 's/MAJOR MILESTONE: --- /Milestone: /g'
    else
      cat
    fi
  " HEAD~$SEARCH_LIMIT..HEAD
  echo "✅ Vorige milestone succesvol afgezwakt."
else
  echo "ℹ️  Geen eerdere Major Milestone gevonden binnen de limiet van $SEARCH_LIMIT."
fi

# 3. Afhandeling van Tags
if [ ! -z "$TAG" ]; then
  echo "🏷️  Verplaatsen van tag $TAG naar de nieuwste commit..."
  git tag -d "$TAG" 2>/dev/null
  git push origin --delete "$TAG" 2>/dev/null
  git tag "$TAG"
fi

# 4. Force Push naar Dev
echo "📤 Force pushing naar y1-factory (dev)..."
git push origin main --force --tags

# 5. Synchronisatie naar Productie
if [ -d "../athena" ]; then
  echo "🚀 Synchroniseren naar Productie monorepo (athena)..."
  cd ../athena
  git fetch y1-factory-local
  git checkout -B main y1-factory-local/main
  if [ ! -z "$TAG" ]; then
    git tag -f "$TAG"
  fi
  echo "📤 Force pushing naar athena-cms-factory (prod)..."
  git push origin main --force --tags
  cd - >/dev/null
  echo "✅ Productie sync voltooid."
else
  echo "⚠️  Productie map ../athena niet gevonden. Sync overgeslagen."
fi

echo "=================================================="
echo "🎉 MAJOR MILESTONE SYNC VOLTOOID!"
echo "=================================================="
