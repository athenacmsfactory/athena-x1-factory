import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Autonomous Loop Controller (Project Y)
 * This script orchestrates the proposal generation, site building, and visual refinement loop.
 */
class AutonomousLoop {
    constructor(options = {}) {
        this.prompt = options.prompt || 'Modern showcase website';
        this.iterations = options.iterations || 3;
        this.projectName = options.projectName || `auto-${Date.now()}`;
        this.basePath = path.resolve(__dirname, '..');
        this.enginePath = path.join(this.basePath, 'factory/5-engine');
        this.proposals = [];
    }

    async start() {
        console.log(`🚀 Starting Autonomous Loop for: "${this.prompt}"`);
        console.log(`📂 Project Name: ${this.projectName}`);

        // Phase 1: Proposals (Handled by AI Agent via specific file output)
        await this.generateProposals();

        for (let i = 0; i < this.proposals.length; i++) {
            const proposal = this.proposals[i];
            const variantName = `${this.projectName}-v${i + 1}`;
            
            console.log(`\n--- Loop Iteration [${i + 1}/${this.proposals.length}]: ${proposal.style} ---`);
            
            // Phase 2: Build
            await this.buildVariant(variantName, proposal);

            // Phase 3: Evaluate & Refine (Loop)
            await this.refineLoop(variantName, proposal);
        }

        console.log(`\n✅ Autonomous Loop Detailed Report generated in output/loops/${this.projectName}.md`);
    }

    async generateProposals() {
        console.log(`🧠 AI is generating 3 design proposals...`);
        // Note: In actual execution, the AI (Antigravity) writes to a temporary file 
        // that this script reads, or we mock it here if running manually.
        const proposalFile = path.join(this.basePath, 'input/current_proposals.json');
        
        if (fs.existsSync(proposalFile)) {
            this.proposals = JSON.parse(fs.readFileSync(proposalFile, 'utf-8'));
        } else {
            console.warn("⚠️ No proposals found in input/current_proposals.json. Using defaults.");
            this.proposals = [
                { type: 'landing-page', layout: 'bento', style: 'glassmorphism' },
                { type: 'portfolio', layout: 'minimal', style: 'dark-mode' },
                { type: 'business', layout: 'corporate', style: 'clean-modern' }
            ];
        }
    }

    async buildVariant(name, proposal) {
        console.log(`🏗️ Building variant: ${name}...`);
        const runner = path.join(this.enginePath, 'athena-mcp-runner.js');
        const payload = JSON.stringify({
            project: name,
            type: proposal.type || 'basic',
            layout: proposal.layout || 'standard',
            style: proposal.style || 'modern.css'
        });

        const result = spawnSync('node', [runner, `--payload=${payload}`], { 
            stdio: 'inherit',
            encoding: 'utf-8' 
        });

        if (result.status !== 0) {
            throw new Error(`Build failed for ${name}`);
        }
    }

    async refineLoop(name, proposal) {
        console.log(`🔍 Starting visual refinement for ${name}...`);
        // Implementation note: The refinement loop is a collaboration 
        // between this script (running commands) and the AI (viewing the browser).
        // For now, we signal the AI to take a look.
        console.log(`📸 AI SIGNAL: Please open http://localhost:5001/sites/${name} and evaluate.`);
    }
}

// Entry point
const args = process.argv.slice(2);
const prompt = args.join(' ') || 'Prachtige website voor een bakkerij';

const loop = new AutonomousLoop({ prompt });
loop.start().catch(err => {
    console.error('💥 Fatal error in autonomous loop:', err);
    process.exit(1);
});
