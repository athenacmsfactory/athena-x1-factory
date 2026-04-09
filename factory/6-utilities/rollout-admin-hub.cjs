const fs = require('fs');
const path = require('path');

/**
 * Athena Admin Hub Rollout Utility
 * Standardizes the Admin Hub for selected shop sitetypes.
 */

const TARGET_SITETYPES = [
  'webshop-mollie',
  'webshop-order',
  'webshop-stripe'
];

const SOURCE_ADMIN_PATH = path.resolve(__dirname, '../../sites/kdc-test-shop/src/pages/Admin.jsx');
const FACTORY_BASE = path.resolve(__dirname, '../3-sitetypes/unified');

console.log('🔱 Starting Athena Admin Hub Rollout...');

if (!fs.existsSync(SOURCE_ADMIN_PATH)) {
  console.error('❌ Source Admin.jsx not found at:', SOURCE_ADMIN_PATH);
  process.exit(1);
}

const adminSource = fs.readFileSync(SOURCE_ADMIN_PATH, 'utf8');

TARGET_SITETYPES.forEach(siteType => {
  const sitePath = path.join(FACTORY_BASE, siteType);
  if (!fs.existsSync(sitePath)) {
    console.warn(`⚠️  Skipping ${siteType}: Directory not found.`);
    return;
  }

  console.log(`📦 Patching ${siteType}...`);

  // 1. Copy Admin.jsx
  const pagesDir = path.join(sitePath, 'src/pages');
  if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });
  fs.writeFileSync(path.join(pagesDir, 'Admin.jsx'), adminSource);

  // 2. Patch App.jsx for Routing
  const appPath = path.join(sitePath, 'src/App.jsx');
  if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, 'utf8');
    
    // Add Import if missing
    if (!appContent.includes("import Admin from './pages/Admin'")) {
      appContent = appContent.replace(/import .* from '.\/pages\/.*';?\n/, (match) => {
        return `${match}import Admin from './pages/Admin';\n`;
      });
    }

    // Add Route
    if (!appContent.includes('path="/admin"')) {
      const routeTag = '<Route path="/admin" element={<Admin />} />';
      appContent = appContent.replace(/<Routes>(\s*<Route)/, `<Routes>\n          ${routeTag}$1`);
    }

    fs.writeFileSync(appPath, appContent);
  }

  // 3. Patch firebase.js for additional exports
  const fbPath = path.join(sitePath, 'src/lib/firebase.js');
  if (fs.existsSync(fbPath)) {
    let fbContent = fs.readFileSync(fbPath, 'utf8');
    if (!fbContent.includes('onSnapshot')) {
      fbContent = fbContent.replace(
        /getFirestore, (.*) } from 'firebase\/firestore'/,
        "getFirestore, $1, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'"
      );
      fs.writeFileSync(fbPath, fbContent);
    }
  }

  console.log(`✅ ${siteType} updated.`);
});

console.log('\n✨ Rollout complete. All targeted shop types now feature the Athena Admin Hub.');
