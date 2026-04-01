const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const TARGET_FILE = path.join(DATA_DIR, 'all_data.json');
const EXCLUDE_FILES = ['all_data.json', 'all_data_showcase.json'];

function syncData() {
    console.log('🔄 Sychronizing Athena Data components...');
    
    try {
        const files = fs.readdirSync(DATA_DIR);
        const masterData = {};

        files.forEach(file => {
            if (file.endsWith('.json') && !EXCLUDE_FILES.includes(file)) {
                const key = path.parse(file).name;
                const filePath = path.join(DATA_DIR, file);
                
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    if (!content || content.trim() === '') {
                        masterData[key] = file.startsWith('_') || key === 'innovatie' ? [] : {};
                        return;
                    }
                    masterData[key] = JSON.parse(content);
                } catch (err) {
                    console.error(`❌ Error parsing ${file}:`, err.message);
                }
            }
        });

        if (!masterData.section_order) masterData.section_order = [];
        if (!masterData.display_config) masterData.display_config = { sections: {} };

        fs.writeFileSync(TARGET_FILE, JSON.stringify(masterData, null, 2), 'utf8');
        console.log(`✅ ${TARGET_FILE} successfully updated.`);
    } catch (err) {
        console.error('❌ Sync failed:', err.message);
        if (!process.argv.includes('--watch')) process.exit(1);
    }
}

// Initial sync
syncData();

// Watch Mode
if (process.argv.includes('--watch')) {
    console.log(`👀 Watching ${DATA_DIR} for changes...`);
    
    let debounceTimer;
    fs.watch(DATA_DIR, (eventType, filename) => {
        if (filename && filename.endsWith('.json') && !EXCLUDE_FILES.includes(filename)) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                console.log(`📝 Change detected in ${filename}. Re-syncing...`);
                syncData();
            }, 100);
        }
    });
}
