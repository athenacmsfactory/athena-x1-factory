/**
 * @file component-registry.js
 * @description Maps layout types to React components.
 */

export const ComponentRegistry = {
    'hero': { name: 'Hero', path: './components/Hero' },
    'testimonials': { name: 'Testimonials', path: './components/Testimonials' },
    'team': { name: 'Team', path: './components/Team' },
    'faq': { name: 'FAQ', path: './components/FAQ' },
    'cta': { name: 'CTA', path: './components/CTA' },
    'product': { name: 'ProductGrid', path: './components/ProductGrid' },
    'about': { name: 'AboutSection', path: './components/AboutSection' },
    'gallery': { name: 'GenericSection', path: './components/GenericSection' },
    'grid': { name: 'GenericSection', path: './components/GenericSection' },
    'list': { name: 'GenericSection', path: './components/GenericSection' }
};

export function getComponentForSection(sectionName) {
    const lower = sectionName.toLowerCase();

    if (lower === 'basis' || lower === 'basisgegevens' || lower === 'hero') return ComponentRegistry['hero'];
    if (lower.includes('about') || lower.includes('info')) return ComponentRegistry['about'];
    if (lower.includes('testimonial') || lower.includes('review') || lower.includes('ervaring')) return ComponentRegistry['testimonials'];
    if (lower.includes('team') || lower.includes('medewerker') || lower.includes('wie_zijn_wij')) return ComponentRegistry['team'];
    if (lower.includes('faq') || lower.includes('vragen')) return ComponentRegistry['faq'];
    if (lower.includes('cta') || lower.includes('banner') || lower.includes('actie')) return ComponentRegistry['cta'];
    if (lower.includes('product') || lower.includes('shop') || lower.includes('dienst') || lower.includes('feature') || lower.includes('services')) return ComponentRegistry['product'];
    if (lower.includes('gallery') || lower.includes('foto') || lower.includes('portfolio')) return ComponentRegistry['gallery'];

    return ComponentRegistry['list']; // Default
}
