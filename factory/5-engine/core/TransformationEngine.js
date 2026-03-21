import * as recast from 'recast';
import * as babelParser from 'recast/parsers/babel.js';

/**
 * Transformation Engine (v2.1)
 * Uses AST-based manipulation for JS/JSX files and regex fallback for others.
 * Optimized for JSX support via built-in babel parser.
 */
export class TransformationEngine {
    constructor(options = {}) {
        this.variables = options.variables || {};
        this.flags = options.flags || {};
    }

    transform(content, fileName) {
        if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) {
            try {
                return this.transformAST(content, fileName);
            } catch (e) {
                console.warn(`⚠️ AST transform failed for ${fileName}, falling back to regex:`, e.message);
                return this.transformRegex(content);
            }
        }
        return this.transformRegex(content);
    }

    transformAST(content, fileName) {
        const ast = recast.parse(content, {
            parser: babelParser
        });

        const self = this;

        recast.visit(ast, {
            // 1. Fix Imports
            visitImportDeclaration(path) {
                const source = path.node.source.value;
                if (source.includes('shared/components/')) {
                    const comp = source.split('shared/components/').pop();
                    path.node.source.value = `./components/${comp}`;
                }
                if (source.includes('2-templates/components/')) {
                    const comp = source.split('2-templates/components/').pop();
                    path.node.source.value = `./${comp}`;
                }
                return false;
            },

            // 2. Variable Replacement in String Literals
            visitLiteral(path) {
                if (typeof path.node.value === 'string') {
                    let val = path.node.value;
                    Object.entries(self.variables).forEach(([k, v]) => {
                        val = val.replace(new RegExp(`{{${k}}}`, 'g'), v);
                    });
                    path.node.value = val;
                }
                return false;
            },

            // Template Literal replacement
            visitTemplateLiteral(path) {
                path.node.quasis.forEach(quasi => {
                    let val = quasi.value.raw;
                    Object.entries(self.variables).forEach(([k, v]) => {
                        val = val.replace(new RegExp(`{{${k}}}`, 'g'), v);
                    });
                    quasi.value.raw = val;
                    quasi.value.cooked = val;
                });
                return false;
            }
        });

        let result = recast.print(ast).code;
        // Apply regex for conditional blocks (still the most reliable for multiline removal)
        result = this.transformConditionalBlocks(result);

        // Final Pass: Clean up unused imports if it's a JS/JSX file
        if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) {
            try {
                result = this.pruneUnusedImports(result);
            } catch (e) {
                console.warn(`⚠️ Import pruning failed for ${fileName}:`, e.message);
            }
        }

        return result;
    }

    /**
     * Removes imports that are not used in the code.
     */
    pruneUnusedImports(content) {
        const ast = recast.parse(content, { parser: babelParser });
        const usedIdentifiers = new Set();
        const importDeclarations = [];

        recast.visit(ast, {
            visitIdentifier(path) {
                // Check if this identifier is part of a usage, not a declaration
                const parent = path.parentPath.node;
                const isDeclaration = (parent.type === 'ImportSpecifier' || 
                                     parent.type === 'ImportDefaultSpecifier' || 
                                     parent.type === 'VariableDeclarator' ||
                                     parent.type === 'FunctionDeclaration');
                
                if (!isDeclaration) {
                    usedIdentifiers.add(path.node.name);
                }
                this.traverse(path);
            },
            visitImportDeclaration(path) {
                importDeclarations.push(path);
                this.traverse(path);
            }
        });

        // Filter specifiers
        importDeclarations.forEach(path => {
            const node = path.node;
            node.specifiers = node.specifiers.filter(specifier => {
                return usedIdentifiers.has(specifier.local.name);
            });

            // If no specifiers left, remove the whole declaration (unless it's a side-effect import)
            if (node.specifiers.length === 0 && !node.source.value.endsWith('.css')) {
                path.remove();
            }
        });

        return recast.print(ast).code;
    }

    transformRegex(content) {
        let result = content;
        Object.entries(this.variables).forEach(([k, v]) => {
            result = result.replace(new RegExp(`{{${k}}}`, 'g'), v);
        });
        return this.transformConditionalBlocks(result);
    }

    transformConditionalBlocks(content) {
        let result = content;
        const blocks = ['SHOP', 'NON_SHOP', 'DOCK', 'AUTONOMOUS', 'SHOP_IMPORT', 'SHOP_WRAPPER', 'NON_SHOP_WRAPPER'];
        blocks.forEach(block => {
            let isMatch = false;
            if (block.includes('SHOP')) isMatch = this.flags.isWebshop;
            if (block.includes('NON_SHOP')) isMatch = !this.flags.isWebshop;
            if (block === 'DOCK') isMatch = this.flags.isDocked;
            if (block === 'AUTONOMOUS') isMatch = !this.flags.isDocked;

            const startMarker = new RegExp(`\\/\\* {{${block}.*?_START}} \\*\\/`, 'g');
            const endMarker = new RegExp(`\\/\\* {{${block}.*?_END}} \\*\\/`, 'g');
            const jsxStartMarker = new RegExp(`{\\/\\* {{${block}.*?_START}} \\*\\/}`, 'g');
            const jsxEndMarker = new RegExp(`{\\/\\* {{${block}.*?_END}} \\*\\/}`, 'g');

            if (isMatch) {
                result = result.replace(startMarker, '').replace(endMarker, '')
                    .replace(jsxStartMarker, '').replace(jsxEndMarker, '');
            } else {
                const blockRegex = new RegExp(`\\/\\* {{${block}.*?_START}} \\*\\/[\\s\\S]*?\\/\\* {{${block}.*?_END}} \\*\\/`, 'g');
                const jsxBlockRegex = new RegExp(`{\\/\\* {{${block}.*?_START}} \\*\\/}[\\s\\S]*?{\\/\\* {{${block}.*?_END}} \\*\\/}`, 'g');
                result = result.replace(blockRegex, '').replace(jsxBlockRegex, '');
            }
        });
        return result;
    }
}
