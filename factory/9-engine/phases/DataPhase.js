import fs from 'fs';
import path from 'path';
import BasePhase from './BasePhase.js';
import { SheetHelper } from '../lib/SheetHelper.js';

export default class DataPhase extends BasePhase {
    constructor() {
        super('Data');
    }

    async execute(ctx) {
        const spreadsheetId = ctx.spreadsheetId || process.env.MASTER_TEMPLATE_ID;
        const dataDir = path.join(ctx.projectDir, 'src/data');
        const seedDir = path.join(ctx.libraryRoot, 'seed-data');

        if (!spreadsheetId) {
            this.log(`No spreadsheetId found. Falling back to Local-First (Seed Data)...`);
            if (fs.existsSync(seedDir)) {
                const seedFiles = fs.readdirSync(seedDir).filter(f => f.endsWith('.json'));
                seedFiles.forEach(file => {
                    fs.copyFileSync(path.join(seedDir, file), path.join(dataDir, file));
                });
                this.log(`  -> Restored ${seedFiles.length} seed data files to src/data/`);
            } else {
                this.log(`⚠️ Warning: No seed data found in ${seedDir}`);
                fs.writeFileSync(path.join(dataDir, 'section_order.json'), JSON.stringify([], null, 2));
            }
            return;
        }

        this.log(`Syncing data for ${ctx.projectName} from Google Sheets (${spreadsheetId})...`);
        
        try {
            const helper = new SheetHelper(path.join(process.cwd(), 'service-account.json'));
            const tabs = await helper.getSheetTabs(spreadsheetId);
            const sectionOrder = [];

            for (const tab of tabs) {
                this.log(`Processing Tab: ${tab}`);
                const data = await helper.getTabData(spreadsheetId, tab);
                const fileName = tab.toLowerCase().replace(/ /g, '_');
                
                fs.writeFileSync(path.join(dataDir, `${fileName}.json`), JSON.stringify(data, null, 2));
                
                if (!tab.startsWith('_')) {
                    sectionOrder.push(fileName);
                    this.log(`  -> Saved as Section: ${fileName}.json`);
                } else {
                    this.log(`  -> Saved as Metadata: ${fileName}.json`);
                }
            }

            fs.writeFileSync(path.join(dataDir, 'section_order.json'), JSON.stringify(sectionOrder, null, 2));
            this.log(`Final Section Order: ${sectionOrder.join(', ')}`);
        } catch (error) {
            this.log(`❌ Sheet Sync failed: ${error.message}`);
            this.log(`Attempting fallback to local seed data...`);
            // Fallback logic
            if (fs.existsSync(seedDir)) {
                fs.readdirSync(seedDir).forEach(file => fs.copyFileSync(path.join(seedDir, file), path.join(dataDir, file)));
            }
        }
    }
}
