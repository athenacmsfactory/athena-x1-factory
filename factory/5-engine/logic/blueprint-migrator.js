import fs from 'fs';
import path from 'path';

const UNIFIED_DIR = '/home/kareltestspecial/0-IT/4-pj/x-v9/athena/factory/3-sitetypes/unified/';

const migrateBlueprint = (filePath) => {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!content.data_structure) return;

    const basisIndex = content.data_structure.findIndex(t => t.table_name === 'basis');
    if (basisIndex === -1) return;

    const basis = content.data_structure[basisIndex];
    const otherTables = content.data_structure.filter((_, i) => i !== basisIndex);

    // 1. Header Table
    const header = {
        table_name: "header",
        columns: [
            { name: "site_name", description: "Naam van de website." },
            { name: "site_logo", description: "URL naar het logo." },
            { name: "nav_links", description: "JSON array van navigatie links." }
        ]
    };

    // 2. Hero Table
    const hero = {
        table_name: "hero",
        columns: [
            { name: "hero_header", description: "Hoofdtitel van de website." },
            { name: "hero_tagline", description: "Ondertitel of introductietekst." },
            { name: "hero_image", description: "Achtergrondafbeelding van de hero." },
            { name: "cta_text", description: "Tekst op de actieknop." },
            { name: "cta_url", description: "Bestemming van de actieknop." }
        ]
    };

    // 3. Footer Table
    const footer = {
        table_name: "footer",
        columns: [
            { name: "footer_info", description: "Korte tekst over het bedrijf." },
            { name: "contact_email", description: "E-mailadres voor contact." },
            { name: "contact_locatie", description: "Adres of locatie." },
            { name: "customer_service_links", description: "Links naar klantenservice pagina's." },
            { name: "social_links", description: "Links naar sociale media profielen." }
        ]
    };

    // Replace basis with the new 1-1-1 tables
    content.data_structure = [header, hero, footer, ...otherTables];

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`✅ Migrated ${path.basename(filePath)} to 1-1-1 standard.`);
};

const run = () => {
    const sitetypes = fs.readdirSync(UNIFIED_DIR);
    sitetypes.forEach(type => {
        const blueprintDir = path.join(UNIFIED_DIR, type, 'blueprint');
        if (fs.existsSync(blueprintDir)) {
            const files = fs.readdirSync(blueprintDir).filter(f => f.endsWith('.json'));
            files.forEach(file => migrateBlueprint(path.join(blueprintDir, file)));
        }
    });
};

run();
