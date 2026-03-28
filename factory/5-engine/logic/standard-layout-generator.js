import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getComponentForSection } from '../lib/component-registry.js';
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

  // Decide which components are needed (always include GenericSection as fallback)
  sections.forEach(sec => {
    const comp = getComponentForSection(sec);
    if (comp) usedComponents.add(comp);
  });

  // Build imports — GenericSection is hardcoded in the template, exclude from dynamic list
  const dynamicImports = Array.from(usedComponents)
    .filter(c => c.name !== 'GenericSection')
    .map(c => {
      const cleanPath = c.path.replace('./components/', './');
      return `import ${c.name} from '${cleanPath}';`;
    });

  const imports = dynamicImports.join('\n');
  const features = JSON.stringify(blueprint.features || {});

  // Template Path
  const templatePath = path.join(__dirname, '../../2-templates/logic/Section.base.jsx');
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  // Build mapping logic dynamically — only reference components that ARE imported
  const importedNames = new Set(
    Array.from(usedComponents)
      .filter(c => c.name !== 'GenericSection')
      .map(c => c.name)
  );

  const conditions = [];
  if (importedNames.has('Hero')) {
    conditions.push(`if (lower === 'basis' || lower === 'basisgegevens' || lower === 'hero') return Hero;`);
  }
  if (importedNames.has('AboutSection')) {
    conditions.push(`if (lower.includes('about') || lower.includes('info')) return AboutSection;`);
  }
  if (importedNames.has('Testimonials')) {
    conditions.push(`if (lower.includes('testimonial') || lower.includes('review') || lower.includes('ervaring')) return Testimonials;`);
  }
  if (importedNames.has('Team')) {
    conditions.push(`if (lower.includes('team') || lower.includes('medewerker') || lower.includes('wie_zijn_wij')) return Team;`);
  }
  if (importedNames.has('FAQ')) {
    conditions.push(`if (lower.includes('faq') || lower.includes('vragen')) return FAQ;`);
  }
  if (importedNames.has('CTA')) {
    conditions.push(`if (lower.includes('cta') || lower.includes('banner') || lower.includes('actie')) return CTA;`);
  }
  if (importedNames.has('ProductGrid')) {
    conditions.push(`if (lower.includes('product') || lower.includes('shop') || lower.includes('dienst') || lower.includes('feature') || lower.includes('services')) return ProductGrid;`);
  }

  const mappingLogic = conditions.length > 0
    ? conditions.join('\n      ')
    : '// No special mappings — using GenericSection for all';

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
  engine.setVariable('IMPORTS', imports);
  engine.setVariable('MAPPING_LOGIC', mappingLogic);
  engine.setVariable('COMPONENT_RETURN', componentReturn);
  engine.setVariable('FEATURES', features);

  // Transform
  const code = engine.transform(templateContent, 'Section.jsx');

  return code.trim();
}
