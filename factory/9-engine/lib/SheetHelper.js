import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

/**
 * 📊 SheetHelper v9.0
 * Handelt de communicatie met de Google Sheets API af volgens de 1-op-1 regel.
 */
export class SheetHelper {
    constructor(credentialsPath) {
        this.auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }

    async getSheetTabs(spreadsheetId) {
        try {
            const response = await this.sheets.spreadsheets.get({ spreadsheetId });
            return response.data.sheets.map(s => s.properties.title);
        } catch (error) {
            console.error(`[SheetHelper] Error fetching spreadsheet metadata (${spreadsheetId}):`, error.message);
            if (error.response && error.response.data) {
                console.error(`[SheetHelper] Details:`, JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }

    async getTabData(spreadsheetId, tabName) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${tabName}!A1:Z100`,
            });
            const rows = response.data.values || [];
            if (rows.length < 2) return [];

            const headers = rows[0];
            return rows.slice(1).map(row => {
                const entry = {};
                headers.forEach((h, i) => entry[h] = row[i] || "");
                return entry;
            });
        } catch (error) {
            console.error(`[SheetHelper] Error fetching tab "${tabName}":`, error.message);
            if (error.response && error.response.data) {
                console.error(`[SheetHelper] Details:`, JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }
}
