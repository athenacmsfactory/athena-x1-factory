import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🔱 ProjectGenerator v9.0 (Lego Edition)
 * De centrale orchestrator voor het bouwen van sites vanuit de Lego Library.
 */
export class ProjectGenerator {
    constructor(config) {
        // Vind de root van de repository (3 levels up van factory/9-engine/core)
        const repoRoot = path.resolve(__dirname, '../../../');
        const factoryRoot = path.join(repoRoot, 'factory');

        this.config = config;
        this.ctx = {
            projectName: config.projectName,
            spreadsheetId: config.spreadsheetId,
            safeName: config.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            projectDir: path.join(repoRoot, 'sites', config.projectName),
            libraryRoot: path.join(factoryRoot, '9-library'),
            engineRoot: path.join(factoryRoot, '9-engine'),
            repoRoot: repoRoot,
            factoryRoot: factoryRoot
        };
    }

    async run() {
        console.log(`\n🚀 Building v9.0 Lego Project: ${this.ctx.projectName}`);
        console.log(`📂 Target Directory: ${this.ctx.projectDir}`);
        
        const phases = [
            'Initialize',
            'Data',
            'Template',
            'Component',
            'Finalize'
        ];

        for (const phaseName of phases) {
            console.log(`[Phase: ${phaseName}] Starting...`);
            const PhaseModule = await import(`../phases/${phaseName}Phase.js`);
            const PhaseClass = PhaseModule.default;
            const phase = new PhaseClass();
            await phase.execute(this.ctx);
        }

        console.log(`\n✅ v9.0 Project Ready: ${this.ctx.projectDir}`);
    }
}
