#!/usr/bin/env node
import { ProjectGenerator } from './core/ProjectGenerator.js';
import dotenv from 'dotenv';

/**
 * 🔱 Lego Factory CLI (v9.0)
 * Usage: node cli.js <project-name> [spreadsheet-id]
 */
dotenv.config();

const projectName = process.argv[2];
const spreadsheetId = process.argv[3] || process.env.MASTER_TEMPLATE_ID;

if (!projectName) {
    console.error('❌ Fout: Geef een projectnaam op.');
    console.log('Usage: pnpm lego <project-name> [spreadsheet-id]');
    process.exit(1);
}

if (!spreadsheetId) {
    console.warn('⚠️ Waarschuwing: Geen spreadsheetId opgegeven en MASTER_TEMPLATE_ID niet gevonden in .env');
}

async function start() {
    try {
        const generator = new ProjectGenerator({
            projectName,
            spreadsheetId
        });

        await generator.run();
        
        console.log('\n✨ Lego Site succesvol gegenereerd!');
        console.log(`📂 Locatie: sites/${projectName}`);
        console.log(`🚀 Start dev: cd sites/${projectName} && pnpm install && pnpm dev`);
    } catch (error) {
        console.error('❌ Generatie mislukt:', error);
    }
}

start();
