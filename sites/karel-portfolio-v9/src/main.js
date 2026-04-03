import './style.css'

// Dynamic Project Data
const projects = [
  {
    title: 'Athena CMS Factory',
    description: 'Een robuust monorepo-systeem voor het genereren van statische sites en dashboards.',
    icon: 'fa-cubes',
    color: '#0ea5e9'
  },
  {
    title: 'KDClaw Engine',
    description: 'De AI-gebaseerde "Action Engine" die deze website autonoom heeft gebouwd.',
    icon: 'fa-robot',
    color: '#22d3ee'
  },
  {
    title: 'Tactical Re-integration',
    description: 'Een strategisch platform dat persoonlijke groei koppelt aan professionele kansen.',
    icon: 'fa-shield-halved',
    color: '#818cf8'
  }
];

// Render Projects
const projectContainer = document.getElementById('project-container');

projects.forEach((site, index) => {
  const card = document.createElement('div');
  card.className = 'card glass';
  card.style.animation = `fadeIn ${1.5 + (index * 0.2)}s ease-out`;
  
  card.innerHTML = `
    <i class="fa-solid ${site.icon} fa-3x" style="color: ${site.color}; margin-bottom: 1.5rem;"></i>
    <h3>${site.title}</h3>
    <p style="color: var(--text-muted);">${site.description}</p>
    <a href="#" class="cta-button" style="margin-top: 1.5rem; background: transparent; border: 1px solid ${site.color}; color: ${site.color}; font-size: 0.9rem;">Meer Info</a>
  `;
  
  projectContainer.appendChild(card);
});

// Scroll Effects
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
        const top = window.scrollY;
        const offset = sec.offsetTop - 500;
        const height = sec.offsetHeight;
        
        if(top >= offset && top < offset + height) {
            sec.style.opacity = "1";
            sec.style.transform = "translateY(0)";
        }
    })
});

console.log('✨ KDClaw Engine: Portfolio site initialized successfully.');
