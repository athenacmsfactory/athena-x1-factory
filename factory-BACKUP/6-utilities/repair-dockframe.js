import fs from 'fs';
import path from 'path';

const DOCK_FRAME_PATH = path.resolve(process.cwd(), 'dock/src/components/DockFrame.jsx');

if (!fs.existsSync(DOCK_FRAME_PATH)) {
    console.error("❌ DockFrame.jsx niet gevonden!");
    process.exit(1);
}

let content = fs.readFileSync(DOCK_FRAME_PATH, 'utf8');

// 1. Vervang de onveilige .find() aanroepen in de JSX
content = content.replace(/siteStructure\?\.data\?\.section_settings\?\.find\(s => s\.id === section\)\?\.visible === false/g, "getSectionSetting(section, 'visible') === false");
content = content.replace(/siteStructure\?\.data\?\.section_settings\?\.find\(s => s\.id === section\)\?\.padding/g, "getSectionSetting(section, 'padding')");

// 2. Herstel de toggleSectionVisibility functie
const newToggleFunc = `  const toggleSectionVisibility = (sectionId) => {
    console.log(\`👁️ Toggling visibility for: \${sectionId}\`);
    const settings = siteStructure?.data?.section_settings;
    if (!settings) return;

    let nextVisible = true;
    if (Array.isArray(settings)) {
      const idx = settings.findIndex(s => s.id === sectionId);
      if (idx === -1) return;
      nextVisible = settings[idx].visible === false;
      saveData('section_settings', idx, 'visible', nextVisible);
    } else {
      nextVisible = settings[sectionId]?.visible === false;
      saveData('section_settings', null, \`\${sectionId}.visible\`, nextVisible);
    }

    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({
        type: 'DOCK_UPDATE_SECTION_VISIBILITY',
        section: sectionId,
        value: nextVisible
      }, '*');
    }
  };`;

content = content.replace(/const toggleSectionVisibility = \(sectionId\) => \{[\s\S]*?saveData\('section_settings', sectionIndex, 'visible', nextVisible\);\s*\};/, newToggleFunc);

fs.writeFileSync(DOCK_FRAME_PATH, content, 'utf8');
console.log("✅ DockFrame.jsx is succesvol gerepareerd!");
