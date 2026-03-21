/**
 * SheetMaster.js
 * @description Advanced Google Sheets manipulation (validation, dropdowns, formatting).
 */

import { google } from 'googleapis';

export class SheetMaster {
    constructor(auth) {
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    /**
     * Add a dropdown menu (Data Validation) to a specific range.
     */
    async addDropdown(spreadsheetId, sheetId, startRow, endRow, startCol, endCol, values) {
        const request = {
            spreadsheetId,
            requestBody: {
                requests: [{
                    setDataValidation: {
                        range: {
                            sheetId: sheetId,
                            startRowIndex: startRow,
                            endRowIndex: endRow,
                            startColumnIndex: startCol,
                            endColumnIndex: endCol
                        },
                        rule: {
                            condition: {
                                type: 'ONE_OF_LIST',
                                values: values.map(v => ({ userEnteredValue: v }))
                            },
                            showCustomUi: true,
                            strict: true
                        }
                    }
                }]
            }
        };

        try {
            await this.sheets.spreadsheets.batchUpdate(request);
            console.log(`✅ Dropdown toegevoegd aan kolom ${startCol} met waarden: ${values.join(', ')}`);
        } catch (e) {
            console.error("❌ Fout bij toevoegen dropdown:", e.message);
        }
    }

    /**
     * Add helpful instructions as a note to a cell.
     */
    async addNote(spreadsheetId, sheetId, rowIndex, colIndex, note) {
        const request = {
            spreadsheetId,
            requestBody: {
                requests: [{
                    updateCells: {
                        range: {
                            sheetId: sheetId,
                            startRowIndex: rowIndex,
                            endRowIndex: rowIndex + 1,
                            startColumnIndex: colIndex,
                            endColumnIndex: colIndex + 1
                        },
                        rows: [{
                            values: [{
                                note: note
                            }]
                        }],
                        fields: 'note'
                    }
                }]
            }
        };

        await this.sheets.spreadsheets.batchUpdate(request);
    }
}
