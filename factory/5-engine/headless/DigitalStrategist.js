import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AthenaInterpreter } from '../core/interpreter.js';
import { generateWithAI } from '../core/ai-engine.js';
import { DiscoveryAgent } from './DiscoveryAgent.js';
import { validateProjectName } from '../core/factory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../..');

/**
 * 🧠 Athena Digital Strategist
 * Translates vision into a strategic discovery dossier and triggers provisioning.
 */
export class DigitalStrategist {
    constructor() {
        this.interpreter = new AthenaInterpreter();
        this.discoveryAgent = new DiscoveryAgent();
    }

    async brainstorm(idea, clientEmail = "") {
        console.log(`🧠 Digital Strategist: Brainstorming for idea: "${idea}"`);

        const siteTypes = [
            "basic-dock-type", "professional-service-provider", "tech-consultancy", 
            "webshop-pay", "wellness-spa", "portfolio-kbm"
        ];
        const styles = ["modern", "bold", "classic", "warm", "cyberpunk", "glassmorphism"];

        // 1. Interpret basic config
        const config = await this.interpreter.interpretCreate(idea, siteTypes, styles);
        console.log(`✅ Config determined: ${config.projectName} (${config.siteType})`);

        // 2. Generate full Strategic Discovery
        const systemInstruction = `
            Je bent de 'Athena Strategist'. Jouw taak is om voor een nieuwe website een volledig strategisch dossier (discovery.json) te schrijven.
            
            PROJECT: ${config.projectName}
            SITETYPE: ${config.siteType}
            IDEE: ${idea}

            REGEER UITSLUITEND MET EEN JSON OBJECT IN DIT FORMAAT:
            {
                "strategy": {
                    "tagline": "korte krachtige slogan",
                    "usp": "de hoofdbelofte",
                    "dream_client": "beschrijving van de ideale klant",
                    "pain_point": "het probleem dat we oplossen",
                    "golden_button": "de primaire actie (bv. Boek Nu, Shop Collectie)",
                    "tone": "de gewenste sfeer/stem"
                },
                "structure": {
                    "sections": ["lijst", "van", "secties", "die", "nodig", "zijn"]
                }
            }
        `;

        const strategyResult = await generateWithAI(systemInstruction, { isJson: true });
        
        const discovery = {
            meta: {
                company_name: config.projectName,
                slug: validateProjectName(config.projectName),
                date: new Date().toISOString(),
                status: "prospect",
                version: "2.0"
            },
            strategy: strategyResult.strategy,
            structure: strategyResult.structure,
            technical: {
                client_email: clientEmail,
                legacy_url: ""
            }
        };

        // 3. Save Discovery
        const clientDir = path.join(root, 'input', discovery.meta.slug);
        if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });
        
        fs.writeFileSync(
            path.join(clientDir, 'discovery.json'),
            JSON.stringify(discovery, null, 2)
        );
        console.log(`✅ Strategic dossier saved to input/${discovery.meta.slug}/discovery.json`);

        // 4. Trigger Discovery Agent for Provisioning
        await this.discoveryAgent.provision({
            projectName: config.projectName,
            clientEmail: clientEmail,
            siteType: config.siteType,
            styleName: config.styleName,
            siteModel: config.siteModel || 'SPA',
            layoutName: config.layoutName || 'standard'
        });

        return discovery;
    }
}
