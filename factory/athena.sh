#!/bin/bash
# Athena Dashboard Launcher (v8.8 - PM2 Orchestrated)
# Dit script start de Backend (API) op 5000 en de Frontend (Vite) op 5001 via PM2.

# Bepaal de project root (we zitten in factory/athena.sh)
FACTORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$FACTORY_ROOT/.."
cd "$PROJECT_ROOT"

# Ports
API_PORT=5000
UI_PORT=5001

# Clean up existing processes in PM2
pm2 stop athena-api athena-ui > /dev/null 2>&1
pm2 delete athena-api athena-ui > /dev/null 2>&1

# Extra force cleanup for safety
fuser -k $API_PORT/tcp $UI_PORT/tcp > /dev/null 2>&1
sleep 1

echo "🔱 Starting Athena API (Backend) via PM2..."
cd "$FACTORY_ROOT/../athena-api"
# Start API met pm2
pm2 start server.js --name athena-api --watch --ignore-watch "node_modules logs"
cd "$PROJECT_ROOT"

echo "🌐 Starting Athena Dashboard UI (Frontend) via PM2..."
cd "$PROJECT_ROOT/control/dashboard"
# Start UI (Vite dev) met pm2
# We moeten de pnpm dev opdracht via sh uitvoeren om de juiste environment te hebben
pm2 start "pnpm dev --port $UI_PORT --host" --name athena-ui
cd "$PROJECT_ROOT"

echo "⏳ Wachten op initialisatie door PM2..."
sleep 4

# Open de browser (Absolute Linux Binary)
echo "🌐 Dashboard openen op http://localhost:$UI_PORT..."
USER_DATA_DIR="/home/kareltestspecial/.chrome-linux-profile"
mkdir -p "$USER_DATA_DIR"

if [ -f "/opt/google/chrome/google-chrome" ]; then
    /opt/google/chrome/google-chrome --user-data-dir="$USER_DATA_DIR" --new-window "http://localhost:$UI_PORT" --no-first-run --no-default-browser-check &
else
    xdg-open "http://localhost:$UI_PORT"
fi

echo "✅ Athena is nu actief en wordt beheerd door PM2."
echo "   Gebruik 'pm2 list' om de status te checken."
echo "   Gebruik 'pm2 logs athena-api' voor backend logs."
