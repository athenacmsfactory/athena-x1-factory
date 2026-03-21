import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ComponentRegistry, getComponentForSection } from '../lib/component-registry.js';
import { TransformationEngine } from '../core/TransformationEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Genereert de inhoud voor Section.jsx op basis van de blueprint.
 * @param {Object} blueprint - Het schema.json object van het sitetype.
 * @param {string} editorStrategy - 'docked' of 'autonomous'.
 * @returns {string} - De gegenereerde code voor Section.jsx.
 */
export function generateSectionComponent(blueprint, editorStrategy = 'docked') {
  const sections = blueprint.data_structure.map(t => t.table_name);
  const usedComponents = new Set();

  // Decide which components are needed
  sections.forEach(sec => {
    const comp = getComponentForSection(sec);
    if (comp) usedComponents.add(comp);
  });

  const imports = Array.from(usedComponents).map(c => `import ${c.name} from '${c.path}';`).join('\n');
  const features = JSON.stringify(blueprint.features || {});

  // Footer Logic
  const footerType = blueprint.features?.footer || 'minimal';
  let footerImport = "";
  let footerComponent = "";

  if (footerType === 'expanded') {
      footerImport = "import Footer from './FooterExpanded';";
      footerComponent = "<Footer data={data} />";
  } else if (footerType === 'columns') {
      footerImport = "import Footer from './FooterColumns';";
      footerComponent = "<Footer data={data} />";
  } else {
      footerImport = "import Footer from './FooterMinimal';";
      footerComponent = "<Footer data={data} />";
  }

  // Template Path
  const templatePath = path.join(__dirname, '../../2-templates/logic/Section.base.jsx');
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  // Mapping Logic Generation
  const mappingLogic = `
      // Mapping Logic (Synced with Registry)
      if (lower === 'basis' || lower === 'basisgegevens' || lower === 'hero') {
          return layout === 'split' ? SplitHero : Hero;
      }
      if (lower.includes('about') || lower.includes('info')) return AboutSection;
      if (lower.includes('testimonial') || lower.includes('review') || lower.includes('ervaring')) return Testimonials;
      if (lower.includes('team') || lower.includes('medewerker') || lower.includes('wie_zijn_wij')) return Team;
      if (lower.includes('faq') || lower.includes('vragen')) return FAQ;
      if (lower.includes('cta') || lower.includes('banner') || lower.includes('actie')) return CTA;
      if (lower.includes('product') || lower.includes('shop') || lower.includes('dienst') || lower.includes('feature')) {
          return layout === 'balanced' ? GridBalanced : ProductGrid;
      }
  `.trim();

  // Component Return Logic
  const componentReturn = `
        const Component = getComponent(sectionName);
        const layout = layoutSettings[sectionName] || 'list';
        const sectionSettings = data.section_settings?.[sectionName] || {};
        const sectionBgColor = sectionSettings.backgroundColor || null;
        const sectionStyle = sectionBgColor ? { backgroundColor: sectionBgColor } : {};

        return (
            <Component 
                key={idx} 
                sectionName={sectionName} 
                data={items} 
                layout={layout}
                style={sectionStyle}
                features={${features}} 
            />
        );
  `.trim();

  // Initialize Transformation Engine
  const engine = new TransformationEngine();
  
  // Inject variables
  engine.setVariable('IMPORTS', imports + '\n' + footerImport);
  engine.setVariable('MAPPING_LOGIC', mappingLogic);
  engine.setVariable('COMPONENT_RETURN', componentReturn);
  engine.setVariable('FOOTER', footerComponent);
  engine.setVariable('FEATURES', features);

  // Transform
  const code = engine.transform(templateContent, 'Section.jsx');

  return code.trim();
}
