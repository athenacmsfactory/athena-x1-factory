import fs from 'fs';
import path from 'path';
import { createProject } from '../core/factory.js';

/**
 * 🕵️ Athena Discovery Agent
 * Handles automated client technical provisioning and site configuration discovery.
 */
export class DiscoveryAgent {
    constructor(ctx = {}) {
        this.ctx = ctx;
    }

    async provision(clientData) {
        console.log(`🕵️ Discovery Agent: Provisioning for ${clientData.projectName}...`);
        
        const config = {
            projectName: clientData.projectName,
            clientEmail: clientData.clientEmail,
            siteType: clientData.siteType || 'basic-dock-type',
            track: clientData.track || 'docked',
            siteModel: clientData.siteModel || 'SPA',
            layoutName: clientData.layoutName || 'standard',
            styleName: clientData.styleName || 'modern',
            blueprintFile: clientData.blueprintFile || `${clientData.siteType}.json`,
            autoSheet: true // Always auto-provision sheets for new clients
        };

        try {
            const projectCtx = await createProject(config);
            console.log(`✅ Discovery Agent: Technical provisioning complete for ${clientData.projectName}`);
            return projectCtx;
        } catch (err) {
            console.error(`❌ Discovery Agent: Provisioning failed:`, err.message);
            throw err;
        }
    }

    static async runFromInbox(inboxPath) {
        if (!fs.existsSync(inboxPath)) {
            console.warn("⚠️ Discovery Agent: Inbox not found.");
            return;
        }

        const data = JSON.parse(fs.readFileSync(inboxPath, 'utf8'));
        const agent = new DiscoveryAgent();
        
        for (const request of data.requests || []) {
            if (request.status === 'pending') {
                await agent.provision(request);
                request.status = 'provisioned';
                request.provisionedAt = new Date();
            }
        }

        fs.writeFileSync(inboxPath, JSON.stringify(data, null, 2));
    }
}
