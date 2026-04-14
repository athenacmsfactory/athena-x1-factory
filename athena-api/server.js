import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from 'cors';
import 'dotenv/config';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Managers & Libs
import { AthenaConfigManager } from '../factory/5-engine/lib/ConfigManager.js';
import { AthenaProcessManager } from '../factory/5-engine/lib/ProcessManager.js';
import { AthenaLogManager } from '../factory/5-engine/lib/LogManager.js';
import { AthenaSecretManager } from '../factory/5-engine/lib/SecretManager.js';
import { ExecutionService } from '../factory/5-engine/lib/ExecutionService.js';

// Controllers
import { ProjectController } from '../factory/5-engine/controllers/ProjectController.js';
import { SiteController } from '../factory/5-engine/controllers/SiteController.js';
import { DoctorController } from '../factory/5-engine/controllers/DoctorController.js';
import { PaymentController } from '../factory/5-engine/controllers/PaymentController.js';
import { MarketingController } from '../factory/5-engine/controllers/MarketingController.js';
import { SystemController } from '../factory/5-engine/controllers/SystemController.js';
import { ToolController } from '../factory/5-engine/controllers/ToolController.js';
import { ServerController } from '../factory/5-engine/controllers/ServerController.js';
import { GithubController } from '../factory/5-engine/controllers/GithubController.js';
import { BuildController } from '../factory/5-engine/controllers/BuildController.js';
import { SiteHealer } from '../factory/5-engine/controllers/SiteHealer.js';
import { AutomationController } from '../factory/5-engine/controllers/AutomationController.js';
import { AthenaDataManager } from '../factory/5-engine/lib/DataManager.js';
import { JulesController } from '../factory/5-engine/controllers/JulesController.js';
import { LayoutAIController } from '../factory/5-engine/controllers/LayoutAIController.js';
import { LanguageController } from '../factory/5-engine/controllers/LanguageController.js';
import { AnalyticsController } from '../factory/5-engine/controllers/AnalyticsController.js';


import {
    generateDataStructureAPI,
    generateParserInstructionsAPI,
    generateDesignSuggestionAPI,
    generateCompleteSiteType,
    getExistingSiteTypes
} from './sitetype-api.js';
import { generateWithAI } from '../factory/5-engine/core/ai-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, '..'); // Points to x-v9/athena
const factoryRoot = path.resolve(__dirname, '../factory');    // Points to x-v9/athena/factory
const root = factoryRoot; // Alias for backward compatibility


// --- INITIALIZATION ---
const configManager = new AthenaConfigManager(monorepoRoot);
const pm = new AthenaProcessManager(monorepoRoot);
const lm = new AthenaLogManager(monorepoRoot);
const sm = new AthenaSecretManager(monorepoRoot);
const execService = new ExecutionService(configManager, lm);

const projectCtrl = new ProjectController(configManager, execService);
const siteCtrl = new SiteController(configManager, execService, pm);
const doctorCtrl = new DoctorController(configManager);
const paymentCtrl = new PaymentController(configManager);
const marketingCtrl = new MarketingController(configManager);
const systemCtrl = new SystemController(configManager, lm, sm, execService);
const toolCtrl = new ToolController(configManager, execService);
const serverCtrl = new ServerController(configManager, pm, execService);
const githubCtrl = new GithubController(configManager, execService);
const buildCtrl = new BuildController(configManager, execService);
const healerCtrl = new SiteHealer(configManager);
const dataManager = new AthenaDataManager(configManager.get('paths.factory'));
const autoCtrl = new AutomationController(configManager, dataManager, siteCtrl, buildCtrl, healerCtrl);
const julesCtrl = new JulesController(configManager);
const layoutAICtrl = new LayoutAIController(configManager);
const langCtrl = new LanguageController(configManager);
const analyticsCtrl = new AnalyticsController(configManager);

// Start autopilot (checks for drift every 30 minutes)
autoCtrl.start(30);

const app = express();
const port = 5000; // Forceer dashboard op poort 5001 voor de Site Reviewer

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { id } = req.params;
        const uploadDir = path.join(root, '../input', id, 'input');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// --- UNIFIED PREVIEW PROXY ---
// Deze proxy zorgt ervoor dat alle sites (External & Native) via poort 5000 bereikbaar zijn.
// Dit voorkomt CORS-issues en poort-blokkades op Chromebooks.
const siteProxy = createProxyMiddleware({
    router: (req) => {
        // Detecteer site ID uit /previews/:id of /:id
        const parts = req.originalUrl.split('/').filter(Boolean);
        let id = parts[0] === 'previews' ? parts[1] : parts[0];
        
        if (!id) return null;
        
        // Check of de site een geregistreerde poort heeft
        // We gebruiken fs.readFileSync direct om race conditions met site-ports.json te vermijden
        const registryPath = path.join(factoryRoot, 'config/site-ports.json');
        if (fs.existsSync(registryPath)) {
            try {
                const ports = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                if (ports[id]) return `http://localhost:${ports[id]}`;
            } catch (e) { }
        }
        return null;
    },
    changeOrigin: true,
    ws: true,
    logLevel: 'warn',
    onError: (err, req, res) => {
        res.status(502).send(`Site Preview Proxy Error: Is de site server actief? (${err.message})`);
    }
});

// Proxy voor /previews en voor alle bekende site prefixes
// We laden de lijst dynamisch uit de config om de API niet te blokkeren
const knownSitesPath = path.join(factoryRoot, 'config/site-ports.json');
const knownSites = fs.existsSync(knownSitesPath) ? JSON.parse(fs.readFileSync(knownSitesPath, 'utf8')) : {};

const sitePrefixes = Object.keys(knownSites).map(id => `/${id}`);

app.use(['/previews', ...sitePrefixes], (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    return siteProxy(req, res, next);
});

app.use(express.static(root));

// --- STRATEGY CHAT API ---
app.post('/api/onboard/chat', async (req, res) => {
    const { history, companyName } = req.body;
    
    const systemPrompt = `
        Je bent de Digital Strategist van Athena CMS. Jouw doel is om een nieuwe klant (${companyName || 'onbekend'}) te helpen hun online strategie te bepalen.
        Focus op:
        1. Wie is de doelgroep?
        2. Wat zijn de USP's?
        3. Welke actie moet de bezoeker ondernemen?
        4. Welke data-tabellen zijn essentieel voor hun business?

        Stel korte, krachtige vragen. Wees professioneel maar toegankelijk.
        Antwoord in het Nederlands. Gebruik NOOIT markdown-titels (geen # of ##), alleen tekst en bullets.
    `;

    const fullPrompt = `${systemPrompt}\n\nINTERVIEW HISTORY:\n${history ? history.map(h => `${h.role}: ${h.content}`).join('\n') : ''}\n\nStrategist:`;

    try {
        const response = await generateWithAI(fullPrompt, { 
            isJson: false,
            modelStack: "gemini-3-flash-preview"
        });
        res.json({ response: response || "Excuses, ik kon geen antwoord genereren. Probeer het nog eens." });
    } catch (e) {
        console.error("Chat Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/onboard/finalize', async (req, res) => {
    const { companyName, history } = req.body;
    const safeName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const clientDir = path.join(root, 'input', safeName);
    
    const prompt = `
        Vat het volgende interview samen voor een technisch dossier.
        INTERVIEW:
        ${history.map(h => `${h.role}: ${h.content}`).join('\n')}

        Genereer een JSON object met:
        - "tagline": Korte slogan
        - "business_vertical": Branche type
        - "target_audience": Beschrijving doelgroep
        - "required_tables": Array van tabelnamen die nodig zijn
        - "design_preferences": Sfeerbeschrijving (Modern, Classic, etc.)
        - "summary": Een korte samenvatting voor de site-generator.
    `;

    try {
        const report = await generateWithAI(prompt, { isJson: true });
        if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });
        
        fs.writeFileSync(path.join(clientDir, 'discovery.json'), JSON.stringify(report, null, 2));
        res.json({ success: true, report });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- SYSTEM API ---
app.get('/api/system/config', (req, res) => res.json(systemCtrl.getConfig()));
app.get('/api/system/logs', (req, res) => res.json(systemCtrl.getLogsStatus()));
app.post('/api/system/logs/rotate', async (req, res) => res.json(await systemCtrl.rotateLogs()));
app.post('/api/system/logs/clear', (req, res) => res.json(systemCtrl.clearLogs()));
app.post('/api/system/secrets/sync', async (req, res) => res.json(await systemCtrl.syncSecrets()));
app.get('/api/system-status', (req, res) => res.json(systemCtrl.getSystemStatus()));
app.get('/api/config', (req, res) => res.json(systemCtrl.getSAConfig()));
app.get('/api/settings', (req, res) => res.json(systemCtrl.getSettings()));
app.post('/api/settings', (req, res) => res.json(systemCtrl.updateSettings(req.body)));
app.post('/api/system/shutdown', async (req, res) => res.json(await serverCtrl.shutdown()));

// --- PROJECT API ---
app.get('/api/projects', (req, res) => res.json(projectCtrl.list()));
app.get('/api/projects/:id/files', (req, res) => res.json(projectCtrl.getFiles(req.params.id)));
app.get('/api/projects/:id/content', (req, res) => res.json(projectCtrl.getContent(req.params.id)));
app.post('/api/projects/create', (req, res) => res.json(projectCtrl.create(req.body.projectName)));
app.post('/api/projects/create-from-site', async (req, res) => res.json(projectCtrl.createFromSite(req.body.sourceSiteName, req.body.targetProjectName)));
app.post('/api/projects/:id/upload', upload.array('files'), (req, res) => res.json({ success: true, message: `${req.files.length} bestand(en) geüpload.` }));
app.post('/api/projects/:id/add-text', (req, res) => res.json(projectCtrl.addText(req.params.id, req.body.text, req.body.filename)));
app.post('/api/projects/:id/save-urls', (req, res) => res.json(projectCtrl.saveUrls(req.params.id, req.body.urls)));
app.post('/api/projects/:id/delete', async (req, res) => res.json(await projectCtrl.deleteProject(req.params.id, req.body)));
app.post('/api/projects/:id/rename', async (req, res) => res.json(await projectCtrl.rename(req.params.id, req.body.newName)));
app.post('/api/projects/:id/link-sheet', async (req, res) => res.json(await siteCtrl.linkSheet(req.params.id, req.body.sheetUrl)));
app.post('/api/projects/:id/auto-provision', async (req, res) => res.json(await siteCtrl.autoProvision(req.params.id)));
app.post('/api/projects/:id/reverse-sync', async (req, res) => res.json(await projectCtrl.reverseSync(req.params.id)));
app.post('/api/projects/:id/upload-data', async (req, res) => res.json(await projectCtrl.uploadData(req.params.id)));
app.get('/api/remote-repos', async (req, res) => {
    try {
        res.json(await githubCtrl.listRepositories());
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/projects/remote-delete', async (req, res) => {
    try {
        res.json(await githubCtrl.deleteRepository(req.body.fullName));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- SITE API ---
app.get('/api/sites', (req, res) => res.json(siteCtrl.list()));
app.get('/api/sites/:id/structure', (req, res) => res.json(siteCtrl.getSiteStructure(req.params.id)));
app.post('/api/sites/:id/link-sheet', async (req, res) => res.json(await siteCtrl.linkSheet(req.params.id, req.body.sheetUrl)));
app.post('/api/sites/:id/auto-provision', async (req, res) => res.json(await siteCtrl.autoProvision(req.params.id)));
app.post('/api/sites/:id/pull-from-sheet', async (req, res) => res.json(await siteCtrl.pullFromSheet(req.params.id)));
app.post('/api/sites/:id/sync-to-sheet', async (req, res) => res.json(await siteCtrl.syncToSheet(req.params.id)));
app.get('/api/sites/all-deployments', (req, res) => res.json(siteCtrl.getAllDeployments()));
app.get('/api/styles', (req, res) => res.json(siteCtrl.getStyles()));
// NOTE: getLayouts was removed in V10.1 - layouts are now derived from sitetype blueprints directly.
app.post('/api/create', async (req, res) => res.json(await siteCtrl.create(req.body)));
app.post('/api/deploy', async (req, res) => res.json(await siteCtrl.deploy(req.body.projectName, req.body.commitMsg)));
app.post('/api/sites/:id/theme-info', (req, res) => res.json(siteCtrl.getThemeInfo(req.params.id)));
app.post('/api/sites/:id/update-data', (req, res) => res.json(siteCtrl.updateData(req.params.id, req.body)));
app.post('/api/sites/:id/section-settings', (req, res) => res.json(siteCtrl.updateSectionSettings(req.params.id, req.body)));
app.post('/api/sites/:id/display-config', (req, res) => res.json(siteCtrl.updateDisplayConfig(req.params.id, req.body)));
app.post('/api/sites/:id/update-config', (req, res) => res.json(siteCtrl.updateConfig(req.params.id, req.body)));
app.post('/api/sites/:id/translate', async (req, res) => res.json(await langCtrl.translateProject(req.params.id, req.body.targetLang)));
app.post('/api/sites/:id/add-section', (req, res) => res.json(siteCtrl.addSection(req.params.id, req.body)));
app.post('/api/sites/:id/apply-layout-preset', async (req, res) => res.json(await siteCtrl.applyLayoutPreset(req.params.id, req.body)));
app.post('/api/sites/:id/save-style-preset', (req, res) => res.json(siteCtrl.saveStylePreset(req.params.id, req.body)));
app.post('/api/sites/:id/save-layout-preset', (req, res) => res.json(siteCtrl.saveLayoutPreset(req.params.id, req.body)));
app.post('/api/sites/:id/add-section', (req, res) => res.json(siteCtrl.addSection(req.params.id, req.body)));
app.post('/api/sites/:id/duplicate-section', (req, res) => res.json(siteCtrl.duplicateSection(req.params.id, req.body)));
app.post('/api/sites/:id/rename-section', (req, res) => res.json(siteCtrl.renameSection(req.params.id, req.body)));
app.post('/api/sites/:id/delete-section', (req, res) => res.json(siteCtrl.deleteSection(req.params.id, req.body)));

app.get('/api/sites/:name/status', (req, res) => res.json(siteCtrl.getStatus(req.params.name)));
app.post('/api/sites/:name/install', async (req, res) => res.json(await siteCtrl.install(req.params.name)));
app.post('/api/sites/:name/build', async (req, res) => res.json(await buildCtrl.build(req.params.name)));
app.post('/api/sites/:name/heal', async (req, res) => res.json(await healerCtrl.heal(req.params.name)));
app.post('/api/sites/batch-build', async (req, res) => res.json(await buildCtrl.batchBuild(req.body.sites)));
app.post('/api/sites/:id/preview', async (req, res) => res.json(await siteCtrl.preview(req.params.id, req.body)));
app.post('/api/sites/:id/athenify', async (req, res) => res.json(await siteCtrl.athenifySite(req.params.id)));
app.post('/api/sites/:id/export-to-sheet', async (req, res) => res.json(await siteCtrl.runScript('6-utilities/export-site-to-sheets.js', [req.params.id])));
app.post('/api/sites/update-deployment', (req, res) => res.json(siteCtrl.updateDeployment(req.body)));
app.post('/api/sites/:id/pull-from-sheet', async (req, res) => res.json(await siteCtrl.pullFromSheet(req.params.id)));
app.post('/api/sites/:id/pull-to-temp', async (req, res) => res.json(await siteCtrl.pullToTemp(req.params.id)));
app.post('/api/sites/:id/sync-to-sheet', async (req, res) => res.json(await siteCtrl.syncToSheet(req.params.id)));
app.post('/api/sites/:id/safe-pull', async (req, res) => res.json(await siteCtrl.safePullFromGitHub(req.params.id)));
app.get('/api/sites/:id/compare-sources', async (req, res) => res.json(await siteCtrl.compareSiteSources(req.params.id)));
app.post('/api/sites/:id/park', async (req, res) => res.json(await siteCtrl.park(req.params.id)));
app.post('/api/sites/:id/unpark', async (req, res) => res.json(await siteCtrl.unpark(req.params.id)));
app.post('/api/sites/:id/vault-delete', async (req, res) => res.json(await siteCtrl.deleteFromVault(req.params.id)));
app.post('/api/sites/:id/delete', async (req, res) => res.json(await siteCtrl.deleteSite(req.params.id)));
app.post('/api/system/pull', async (req, res) => res.json(await siteCtrl.safePullFromGitHub(req.params.id)));

app.get('/api/system/automation/status', (req, res) => res.json(autoCtrl.getStatus()));
app.post('/api/system/automation/start', (req, res) => { autoCtrl.start(req.body.interval || 30); res.json({ success: true, message: "Autopilot gestart." }); });
app.post('/api/system/automation/stop', (req, res) => { autoCtrl.stop(); res.json({ success: true, message: "Autopilot gestopt." }); });
app.post('/api/system/automation/run', async (req, res) => { await autoCtrl.checkAll(); res.json({ success: true, message: "Handmatige check voltooid." }); });

// --- MARKETING API ---
app.post('/api/marketing/:id/generate-blog', async (req, res) => res.json(await marketingCtrl.generateBlog(req.params.id, req.body.topic)));
app.post('/api/marketing/:id/generate-seo', async (req, res) => res.json(await marketingCtrl.generateSEO(req.params.id)));
app.post('/api/marketing/:id/generate-proposal', async (req, res) => res.json(await marketingCtrl.generateProposal(req.params.id)));
app.post('/api/marketing/bulk-seo', async (req, res) => res.json(await marketingCtrl.bulkOptimizeSEO(req.body.limit)));

// --- AI ASSISTANT API ---
app.post('/api/ai/jules/advice', async (req, res) => res.json(await julesCtrl.getAdvice(req.body.prompt, req.body.siteId)));
app.post('/api/ai/layout/generate', async (req, res) => res.json(await layoutAICtrl.generateRedesign(req.body.siteId, req.body.sectionName, req.body.goal)));
app.post('/api/ai/layout/ab-test', async (req, res) => res.json(await layoutAICtrl.generateABTest(req.body.siteId, req.body.sectionName)));
app.post('/api/ai/layout/suggest-mapping', async (req, res) => res.json(await layoutAICtrl.suggestMapping(req.body.siteId, req.body.tableName)));

// --- ANALYTICS API ---
app.get('/api/analytics/portfolio', async (req, res) => res.json(await analyticsCtrl.getPortfolioMetrics()));
app.get('/api/analytics/sites/:id', async (req, res) => res.json(await analyticsCtrl.getSiteMetrics(req.params.id)));

// --- TOOLS API ---

app.post('/api/onboard', async (req, res) => res.json(toolCtrl.onboard(req.body.companyName, req.body.websiteUrl, req.body.clientEmail)));
app.post('/api/tools/clone', async (req, res) => res.json(await toolCtrl.cloneProject(req.body.sourceId, req.body.targetId)));
app.post('/api/projects/:id/scrape', async (req, res) => res.json(toolCtrl.scrape(req.params.id, req.body.inputFile)));
app.post('/api/sites/:id/generate-variants', async (req, res) => res.json(toolCtrl.generateVariants(req.params.id, req.body.styles)));
app.post('/api/run-script', async (req, res) => res.json(await toolCtrl.runScript(req.body.script, req.body.args)));
app.get('/api/tools/preview-lego', (req, res) => {
    try {
        const filePath = req.query.file;
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Extract lucide imports to mock them
        let lucideImports = [];
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](?:lucide-react|@lucide\/react)['"];?/g, (match, p1) => {
             p1.split(',').forEach(i => lucideImports.push(i.trim()));
             return '';
        });

        // Strip out other imports and exports so Babel can run it as a script
        content = content.replace(/import\s+.*?['"].*?['"];?/g, '');
        
        let funcName = 'PreviewComponent';
        
        // Catch: export default function Name(...)
        content = content.replace(/export\s+default\s+function\s+(\w+)/g, (match, name) => {
            funcName = name;
            return `function ${name}`;
        });
        
        // Catch: export default Name;
        content = content.replace(/export\s+default\s+(\w+);?/g, (match, name) => {
            funcName = name;
            return ''; // Strip the export
        });
        
        // Fallback for getting the name if it still couldn't find one
        if (funcName === 'PreviewComponent') {
            const funcMatch = content.match(/(?:const|let|var|function)\s+(\w+)\s*=/);
            if (funcMatch) funcName = funcMatch[1];
            else {
                const funcMatch2 = content.match(/function\s+(\w+)/);
                if (funcMatch2) funcName = funcMatch2[1];
            }
        }

        const lucideMocks = lucideImports.map(i => `const ${i} = () => <span className="inline-block w-6 h-6 bg-slate-500/50 rounded-full" title="Icon: ${i}"></span>;`).join('\n');

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = { theme: { extend: { colors: { midnight: '#020024', primary: '#0f172a', accent: '#3b82f6' } } } }
            </script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/lucide@latest"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>body { background: #000; color: #fff; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow-y: auto; }</style>
        </head>
        <body>
            <div id="root" class="w-full"></div>
            <script type="text/babel">
                const { useState, useEffect, useRef, useMemo, useCallback } = React;
                
                // Mocker for icon components that might have been stripped
                window.IconMock = () => <span style={{display:'inline-block', width:24, height:24, background:'currentColor', borderRadius:'50%', opacity:0.5}}></span>;

                // Lucide Mocks
                ${lucideMocks}

                //////////////// COMPONENT CODE ////////////////
                ${content.replace(/<([A-Z]\w+)\s/g, (match, p1) => {
                    // Try to catch missing lucide icons heuristically by catching capitals not defined in content
                    return match;
                })}
                ///////////////////////////////////////////////

                // Generate smart mock data that works as both Array and Object
                const mockData = [
                    { naam: 'Mock Item 1', titel: 'Preview Item 1', title: 'Preview Item 1', beschrijving: 'Dit is een fantastische placeholder tekst voor de live previewer.', tekst: 'Lorum ipsum test.', foto: 'https://picsum.photos/id/10/800/600', image: 'https://picsum.photos/id/10/800/600', url: 'https://picsum.photos/id/10/800/600', vraag: 'Wat is dit?', antwoord: 'Dit is een live preview in de Athena Dashboard Sandbox.', icon: 'globe' },
                    { naam: 'Mock Item 2', titel: 'Preview Item 2', title: 'Preview Item 2', beschrijving: 'Meer tekst om de layout te renderen.', tekst: 'Lorum ipsum test.', foto: 'https://picsum.photos/id/11/800/600', image: 'https://picsum.photos/id/11/800/600', url: 'https://picsum.photos/id/11/800/600', vraag: 'Werkt het?', antwoord: 'Ja, de mock data laadt perfect in, zelfs als het een array moet zijn!', icon: 'star' },
                    { naam: 'Mock Item 3', titel: 'Preview Item 3', title: 'Preview Item 3', beschrijving: 'Nog een extra item zodat grid layouts met 3 kolommen mooi tonen.', tekst: 'Lorum ipsum test.', foto: 'https://picsum.photos/id/12/800/600', image: 'https://picsum.photos/id/12/800/600', url: 'https://picsum.photos/id/12/800/600', vraag: 'En iconen?', antwoord: 'Ook FontAwesome en Icon classes worden weerspiegeld.', icon: 'rocket' }
                ];
                // Bind properties to the array so it also functions as an object for legos that destructure 'data'
                Object.assign(mockData, {
                    tekst_titel: 'Athena Lego Preview',
                    tekst_subtitel: 'Deze mock tekst zorgt dat Single Object legos ook netjes renderen in de Sandbox.',
                    tekst_knop: 'Bekijk Actie',
                    link_knop: '#',
                    link: '#',
                    afbeelding_bg: 'https://picsum.photos/id/13/1920/1080',
                    image: 'https://picsum.photos/id/14/800/600',
                    titel: 'Preview Sectie'
                });

                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(<${funcName} data={mockData} sectionName="Preview_Lego" />);
                
                // Render Lucide icons after mount if any
                setTimeout(() => typeof lucide !== 'undefined' && window.lucide?.createIcons && window.lucide.createIcons(), 500);
            </script>
        </body>
        </html>
        `;
        res.send(html);
    } catch (e) { res.status(500).send('Error rendering preview: ' + e.message); }
});

app.post('/api/tools/read-file', (req, res) => {
    try {
        const content = fs.readFileSync(req.body.file, 'utf8');
        res.json({ success: true, content });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tools/write-file', (req, res) => {
    try {
        fs.writeFileSync(req.body.file, req.body.content, 'utf8');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tools/open-ide', (req, res) => {
    import('child_process').then(({ spawn }) => { 
        spawn('code', [req.body.file], { detached: true }); 
        res.json({ success: true }); 
    }).catch(e => res.status(500).json({ error: e.message }));
});

app.post('/api/set-site', async (req, res) => {
    // Forward to Media Visualizer if it's running
    const port = configManager.get('ports.media') || 5004;
    try {
        const response = await fetch(`http://localhost:${port}/api/set-site`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        // Fallback: just return success if media server is not up
        res.json({ success: true, note: "Media server not reachable, but request accepted." });
    }
});

app.post('/api/sync-to-sheets/:id', async (req, res) => res.json(await siteCtrl.syncToSheet(req.params.id)));
app.post('/api/pull-from-sheets/:id', async (req, res) => res.json(await siteCtrl.pullFromSheet(req.params.id)));

// --- SERVER API ---
app.get('/api/servers/check/:port', (req, res) => res.json(serverCtrl.checkStatus(req.params.port)));
app.post('/api/servers/stop/:type', async (req, res) => res.json(await serverCtrl.stopByType(req.params.type)));
app.post('/api/servers/stop-all', async (req, res) => res.json(await serverCtrl.stopAllSiteServers()));
app.get('/api/servers/active', (req, res) => res.json({ servers: serverCtrl.getActive(req.hostname) }));
app.post('/api/servers/kill/:port', async (req, res) => res.json(await serverCtrl.kill(req.params.port)));
// --- SITETYPE API ---
app.get('/api/sitetype/previews', (req, res) => res.json(siteCtrl.listPreviews()));
app.post('/api/sitetype/:name/preview', async (req, res) => {
    try {
        const result = await siteCtrl.previewSitetypePreview(req.params.name);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/sitetype/:name/provision', async (req, res) => {
    try {
        const result = await siteCtrl.provisionSitetypePreview(req.params.name);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/sitetype/:name/sync', async (req, res) => {
    try {
        const result = await siteCtrl.syncSitetypePreview(req.params.name);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/sitetypes', (req, res) => res.json(getExistingSiteTypes()));
app.get('/api/sitetype/existing', (req, res) => res.json({ success: true, sitetypes: getExistingSiteTypes() }));
app.get('/api/legos', (req, res) => res.json({ success: true, legos: siteCtrl.getLegos() }));

app.post('/api/start-dock', async (req, res) => res.json(await serverCtrl.startDock()));
app.post('/api/start-media-server', async (req, res) => res.json(await serverCtrl.startMediaVisualizer(req.body.siteName)));
app.post('/api/start-layout-server', async (req, res) => res.json(await serverCtrl.startLayoutEditor()));

app.get('/api/blueprints/:name', async (req, res) => {
    try {
        const sitetypesDir = configManager.get('paths.sitetypes');
        const filePath = path.join(sitetypesDir, req.params.name, 'blueprint', `${req.params.name}.json`);
        if (fs.existsSync(filePath)) {
            res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
        } else {
            res.status(404).json({ error: 'Blueprint not found' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/sitetype/create', async (req, res) => res.json(await generateCompleteSiteType(req.body.name, req.body.description, req.body.dataStructure, req.body.designSystem)));

// --- STORAGE API ---
app.get('/api/storage/status', (req, res) => res.json(doctorCtrl.audit(req.query.siteName)));
app.post('/api/storage/policy', (req, res) => res.json(doctorCtrl.setPolicy(req.body.siteName, req.body.policy)));
app.post('/api/storage/enforce', async (req, res) => res.json(await doctorCtrl.enforcePolicy(req.body.siteName)));
app.post('/api/storage/prune-all', async (req, res) => {
    const auditResults = doctorCtrl.audit();
    const actions = auditResults.filter(r => r.policy === 'dormant' && r.hydration === 'hydrated').map(r => ({ site: r.site, ...doctorCtrl.dehydrate(r.site) }));
    
    // Ook temp data opschonen bij een prune-all
    const tempResult = await doctorCtrl.cleanupTempData();
    
    res.json({ success: true, actions, tempResult });
});
app.post('/api/storage/:siteName/hydrate', async (req, res) => res.json(await doctorCtrl.hydrate(req.params.siteName)));
app.post('/api/storage/:siteName/dehydrate', (req, res) => res.json(doctorCtrl.dehydrate(req.params.siteName)));
app.post('/api/storage/cleanup-temp', async (req, res) => res.json(await doctorCtrl.cleanupTempData()));
app.post('/api/storage/prune-pnpm', (req, res) => res.json(doctorCtrl.prunePnpmStore()));


// --- PAYMENT API ---
app.post('/api/payments/create-session', async (req, res) => res.json(await paymentCtrl.createStripeSession(req.body.projectName, req.body.cart, req.body.successUrl, req.body.cancelUrl)));

// --- ROADMAP & TODO API ---
app.get('/api/roadmaps', (req, res) => {
    const roadmapPath = path.join(factoryRoot, 'config/roadmaps.json');
    if (fs.existsSync(roadmapPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: "Fout bij laden roadmaps.json: " + e.message });
        }
    } else {
        res.json({
            title: "Roadmap niet beschikbaar",
            id: "not-found",
            description: "Er is nog geen roadmap.json geconfigureerd.",
            difficulty: "N/A",
            time: "N/A",
            steps: []
        });
    }
});

app.post('/api/blueprints/:name', (req, res) => {
    const { name } = req.params;
    const sitetypesDir = configManager.get('paths.sitetypes');
    const blueprintPath = path.join(sitetypesDir, name, 'blueprint', `${name}.json`);
    try {
        fs.writeFileSync(blueprintPath, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: "Blueprint succesvol opgeslagen." });
    } catch (e) {
        res.status(500).json({ error: "Kon blueprint niet opslaan: " + e.message });
    }
});

// --- ROADMAP & TODO API ---
app.get('/api/todo', (req, res) => {
    const todoPath = path.join(factoryRoot, 'TASKS/_TODO.md');
    if (fs.existsSync(todoPath)) {
        res.json({ content: fs.readFileSync(todoPath, 'utf8') });
    } else {
        res.json({ content: "# TODO\n\n_TODO.md niet gevonden._" });
    }
});

app.get('/api/system/todo', (req, res) => {
    const todoPath = path.join(factoryRoot, 'TASKS/_TODO.md');
    if (fs.existsSync(todoPath)) {
        res.json({ content: fs.readFileSync(todoPath, 'utf8') });
    } else {
        res.json({ content: "# TODO\n\n_TODO.md niet gevonden._" });
    }
});

app.get('/api/system/section-library', (req, res) => {
    const p = path.join(factoryRoot, 'output/SECTION_LIBRARY.json');
    res.json(fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : { sections: [] });
});

app.get('/api/system/style-presets', (req, res) => {
    const p = path.join(factoryRoot, 'config/style-presets.json');
    res.json(fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : { presets: [] });
});

app.get('/api/system/layout-presets', (req, res) => {
    const p = path.join(factoryRoot, 'config/layout-presets.json');
    res.json(fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : { presets: [] });
});



app.listen(port, () => {
    console.log(`🔱 Athena Dashboard running at http://localhost:${port}`);
});
