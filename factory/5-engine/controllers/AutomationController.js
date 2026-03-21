/**
 * AutomationController.js
 * @description The autopilot of Athena Factory.
 * Monitors for data drift and triggers automated rebuilds.
 */

import fs from 'fs';
import path from 'path';

export class AutomationController {
    constructor(configManager, dataManager, siteCtrl, buildCtrl, healerCtrl) {
        this.configManager = configManager;
        this.dataManager = dataManager;
        this.siteCtrl = siteCtrl;
        this.buildCtrl = buildCtrl;
        this.healerCtrl = healerCtrl;
        this.isRunning = false;
        this.interval = null;
        this.stats = { lastRun: null, updatesTriggered: 0, healingsTriggered: 0, errors: 0 };
    }

    /**
     * Start the automation loop
     */
    start(intervalMinutes = 15) {
        if (this.isRunning) return;
        
        console.log(`🤖 Automation Controller started (Interval: ${intervalMinutes}m)`);
        this.isRunning = true;
        this.stats.lastRun = new Date().toISOString();

        this.interval = setInterval(() => this.checkAll(), intervalMinutes * 60 * 1000);
        // Run once immediately
        this.checkAll();
    }

    /**
     * Stop the automation loop
     */
    stop() {
        if (this.interval) clearInterval(this.interval);
        this.isRunning = false;
        console.log("🤖 Automation Controller stopped.");
    }

    /**
     * Check all sites for drift and trigger updates
     */
    async checkAll() {
        console.log(`🔍 [Automation] Checking for data drift at ${new Date().toLocaleTimeString()}...`);
        this.stats.lastRun = new Date().toISOString();

        const sites = this.siteCtrl.list();
        
        for (const siteInfo of sites) {
            const site = siteInfo.name;
            try {
                const drift = await this.dataManager.checkSheetDrift(site);
                
                if (drift.hasDrift) {
                    console.log(`⚡ [Automation] Drift detected for ${site}. Triggering auto-update...`);
                    this.stats.updatesTriggered++;
                    
                    // 1. Pull latest data from Sheet
                    await this.siteCtrl.pullFromSheet(site);
                    
                    // 2. Auto-Heal (Safety Pass)
                    await this.healerCtrl.heal(site);
                    this.stats.healingsTriggered++;
                    
                    // 3. Rebuild the site
                    await this.buildCtrl.build(site);
                    
                    console.log(`✅ [Automation] ${site} successfully updated, healed and rebuilt.`);
                }
            } catch (e) {
                this.stats.errors++;
                console.error(`❌ [Automation] Error processing ${site}:`, e.message);
            }
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            stats: this.stats
        };
    }
}
