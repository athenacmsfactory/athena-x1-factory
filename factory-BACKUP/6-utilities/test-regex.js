import fs from 'fs';
import path from 'path';

// FORCEER UITVOERING OP SPECIFIEK PAD
const TEST_FILE = path.resolve(process.cwd(), 'factory/3-sitetypes/autonomous/agency-luxury/web/standard/components/Header.jsx');

if (!fs.existsSync(TEST_FILE)) {
    console.error("Test file niet gevonden:", TEST_FILE);
    process.exit(1);
}

let content = fs.readFileSync(TEST_FILE, 'utf8');
console.log("Inhoud geladen, lengte:", content.length);

// Simpele vervanging voor de test
const updated = content.replace(/<EditableText[\s\S]*?\/>/g, (match) => {
    console.log("MATCH GEVONDEN!");
    return "<!-- MODERNIZED TEXT -->";
});

if (updated !== content) {
    fs.writeFileSync(TEST_FILE, updated, 'utf8');
    console.log("TEST GESLAAGD: Bestand bijgewerkt.");
} else {
    console.log("TEST MISLUKT: Geen matches gevonden met de regex.");
}
