import path from 'path';
import { fileURLToPath } from 'url';
import { AthenaConfigManager } from '../lib/ConfigManager.js';

// Phases
import { InitializePhase } from './phases/InitializePhase.js';
import { DataPhase } from './phases/DataPhase.js';
import { BoilerplatePhase } from './phases/BoilerplatePhase.js';
import { ComponentPhase } from './phases/ComponentPhase.js';
import { FinalizePhase } from './phases/FinalizePhase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Standard V10.1 resolution: __dirname is athena/factory/5-engine/core
// ../../.. goes up to athena/
const defaultCM = new AthenaConfigManager(path.resolve(__dirname, '../../..'));

export function validateProjectName(name) {
    return name.trim().toLowerCase()
        .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Modular Project Generator (v2.0)
 * Orchestrates the site generation process through a sequence of specialized phases.
 */
export class ProjectGenerator {
    constructor(config, configManager = defaultCM) {
        this.config = config;
        this.configManager = configManager;
        
        // Build shared context
        this.ctx = {
            config: this.config,
            configManager: this.configManager,
            safeName: validateProjectName(config.projectName),
            projectDir: path.join(configManager.get('paths.sites'), validateProjectName(config.projectName)),
            tplRoot: configManager.get('paths.templates'),
            factoryRoot: configManager.get('paths.factory')
        };

        // Define execution pipeline
        this.phases = [
            new InitializePhase(),
            new DataPhase(),
            new BoilerplatePhase(),
            new ComponentPhase(),
            new FinalizePhase()
        ];
    }

    async run() {
        console.log(`\n🔱  Athena Generation (Modular): ${this.ctx.safeName}`);
        
        for (const phase of this.phases) {
            try {
                await phase.execute(this.ctx);
            } catch (err) {
                console.error(`\n❌ Error during phase [${phase.name}]:`, err.message);
                throw err;
            }
        }

        return this.ctx;
    }
}

export async function createProject(config, configManager = defaultCM) {
    const generator = new ProjectGenerator(config, configManager);
    return await generator.run();
}
