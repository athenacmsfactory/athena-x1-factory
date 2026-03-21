/**
 * AnalyticsController.js
 * @description Manages conversion tracking and performance metrics for sites.
 */

import fs from 'fs';
import path from 'path';

export class AnalyticsController {
    constructor(configManager) {
        this.configManager = configManager;
        this.sitesDir = configManager.get('paths.sites');
    }

    /**
     * Get analytics for a site (mock data for now, scalable to real events)
     */
    async getSiteMetrics(siteId) {
        console.log(`📊 Analytics: Fetching metrics for ${siteId}...`);
        
        // In a real scenario, we would query a DB or log aggregator.
        // For the prototype, we generate consistent metrics based on site age.
        const sitePath = path.join(this.sitesDir, siteId);
        if (!fs.existsSync(sitePath)) throw new Error("Site niet gevonden.");

        const stats = fs.statSync(sitePath);
        const ageInDays = Math.floor((Date.now() - stats.birthtimeMs) / (1000 * 60 * 60 * 24));
        
        // Procedural generation of metrics
        const seed = siteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const visitors = (seed % 1000) * (ageInDays + 1);
        const conversionRate = (seed % 5) + 2; // 2% to 7%
        const leads = Math.floor(visitors * (conversionRate / 100));

        return {
            siteId,
            period: "Last 30 Days",
            metrics: {
                visitors,
                bounceRate: (seed % 40) + 20 + "%",
                avgTimeOnSite: (seed % 5) + 1 + "m " + (seed % 60) + "s",
                conversionRate: conversionRate + "%",
                leads,
                stripeRevenue: (leads * (seed % 50 + 10)).toFixed(2) + " EUR"
            }
        };
    }

    /**
     * Get aggregate metrics for the entire factory
     */
    async getPortfolioMetrics() {
        const sites = fs.readdirSync(this.sitesDir).filter(f => 
            fs.statSync(path.join(this.sitesDir, f)).isDirectory() && !f.startsWith('.')
        );

        const results = [];
        for (const site of sites) {
            try {
                results.push(await this.getSiteMetrics(site));
            } catch (e) {}
        }

        const totalVisitors = results.reduce((acc, r) => acc + r.metrics.visitors, 0);
        const totalLeads = results.reduce((acc, r) => acc + r.metrics.leads, 0);

        return {
            totalSites: sites.length,
            aggregated: {
                totalVisitors,
                totalLeads,
                avgConversionRate: (totalLeads / totalVisitors * 100).toFixed(2) + "%"
            },
            details: results
        };
    }
}
