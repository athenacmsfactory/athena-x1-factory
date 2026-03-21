/**
 * athena-agent.js
 * @description The Autonomous Business Agent for Athena CMS.
 * Monitors inbound requests and automates the onboarding-to-live pipeline.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AthenaConfigManager } from './lib/ConfigManager.js';
import { ProjectController } from './controllers/ProjectController.js';
import { SiteController } from './controllers/SiteController.js';
import { ExecutionService } from './lib/ExecutionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

class AthenaAgent {
    constructor() {
        this.configManager = new AthenaConfigManager(ROOT);
        this.execService = new ExecutionService(this.configManager);
        this.projectCtrl = new ProjectController(this.configManager);
        this.siteCtrl = new SiteController(this.configManager);
        this.inboxPath = path.resolve(ROOT, '../input/gateway_inbox.json');
        this.isRunning = false;
    }

    async start() {
        console.log("🔱 Athena Autonomous Agent v1.0 active.");
        this.isRunning = true;
        this.loop();
    }

    async loop() {
        while (this.isRunning) {
            await this.checkInbox();
            await new Promise(r => setTimeout(r, 60000)); // Wait 1 minute
        }
    }

    async checkInbox() {
        console.log(`🔍 [AthenaAgent] Checking inbox at ${new Date().toLocaleTimeString()}...`);
        
        if (!fs.existsSync(this.inboxPath)) return;

        try {
            const data = JSON.parse(fs.readFileSync(this.inboxPath, 'utf8'));
            const newRequests = data.requests.filter(r => r.status === 'pending');

            if (newRequests.length === 0) return;

            console.log(`⚡ [AthenaAgent] Found ${newRequests.length} new requests!`);

            for (const request of newRequests) {
                console.log(`🏗️  Processing request for: ${request.projectName}...`);
                
                try {
                    // 1. Create Project
                    const res = await this.projectCtrl.create({
                        projectName: request.projectName,
                        siteType: request.siteType,
                        clientEmail: request.clientEmail
                    });

                    if (res.success) {
                        request.status = 'provisioned';
                        request.provisionedAt = new Date().toISOString();
                        console.log(`✅ [AthenaAgent] Successfully provisioned ${request.projectName}`);
                    }
                } catch (e) {
                    console.error(`❌ [AthenaAgent] Failed to provision ${request.projectName}:`, e.message);
                    request.status = 'error';
                    request.error = e.message;
                }
            }

            // Save updated inbox
            fs.writeFileSync(this.inboxPath, JSON.stringify(data, null, 2));

        } catch (e) {
            console.error("❌ [AthenaAgent] Inbox processing error:", e.message);
        }
    }
}

const agent = new AthenaAgent();
agent.start().catch(err => console.error(err));
