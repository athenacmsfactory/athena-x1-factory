import React, { useContext, useState } from 'react';
import { DisplayConfigContext } from '../DisplayConfigContext';

const ShowcaseSection = ({ sectionName, items, sectionStyle, data: allData }) => {
  const displayConfig = useContext(DisplayConfigContext);
  const sectionConfig = displayConfig?.sections?.[sectionName] || { visible_fields: [], hidden_fields: [], inline_fields: [] };
  
  const [showArchive, setShowArchive] = useState(false);
  const [archiveData, setArchiveData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamische organisatie bepaling uit _system.json of window.location
  const getOrgName = () => {
    const system = allData?._system || [];
    const githubUser = system.find(s => s.Key === 'github_user')?.Value;
    if (githubUser) return githubUser;

    // Fallback: extract van hostname (bijv. athena-cms-factory.github.io)
    const host = window.location.hostname;
    if (host.includes('.github.io')) {
      return host.split('.')[0];
    }
    return 'athena-cms-factory'; // Ultieme fallback
  };

  const fetchArchive = async () => {
    if (archiveData.length > 0) {
      setShowArchive(!showArchive);
      return;
    }
    setLoading(true);
    const org = getOrgName();
    try {
      const response = await fetch(`https://api.github.com/orgs/${org}/repos?sort=updated&per_page=100`);
      const repos = await response.json();
      
      const excludeList = ['athena-x', 'athena'];
      
      const filteredData = repos
        .filter(repo => !repo.fork && !excludeList.includes(repo.name)) 
        .map(repo => ({
          name: repo.name.replace(/-/g, ' '),
          type: repo.language || 'Project',
          description: repo.description || 'Geen omschrijving beschikbaar.',
          githubLink: repo.html_url,
          liveLink: repo.has_pages ? `https://${org}.github.io/${repo.name}/` : repo.homepage
        }));

      setArchiveData(filteredData);
      setShowArchive(true);
    } catch (e) {
      console.error("Fout bij ophalen archive:", e);
    }
    setLoading(false);
  };

  const visibleItems = items.slice(0, 6);

  return (
    <section 
      id={sectionName} 
      data-dock-section={sectionName} 
      className="px-6 bg-slate-50 transition-all duration-300" 
      style={{ 
        ...sectionStyle,
        paddingTop: `var(--section-padding-y, 6rem)`,
        paddingBottom: `var(--section-padding-y, 6rem)`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 capitalize leading-tight">
              {sectionName.replace(/_/g, ' ')}
            </h2>
            <div className="h-1.5 w-32 bg-accent rounded-full mb-8 mx-auto"></div>
            <p className="text-xl text-slate-600 font-light">
              Digital Architecture That Scales. Een selectie van onze meest recente projecten.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {visibleItems.map((item, index) => {
            const allKeys = Object.keys(item).filter(k => 
                !['absoluteIndex', '_hidden', 'id', 'pk', 'uuid'].some(tf => k.toLowerCase().includes(tf))
            );

            const visibleFields = sectionConfig.visible_fields?.length > 0 
                ? sectionConfig.visible_fields.filter(k => allKeys.includes(k))
                : allKeys.filter(k => !/foto|afbeelding|url|image|img|icon/i.test(k));

            const hiddenFields = sectionConfig.hidden_fields || [];
            const fieldsToRender = visibleFields.filter(f => !hiddenFields.includes(f));
            
            const imgKey = Object.keys(item).find(k => /foto|afbeelding|url|image|img/i.test(k));
            const linkKey = Object.keys(item).find(k => /link|url|website/i.test(k));

            return (
              <div key={index} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {imgKey && item[imgKey] && (
                    <img 
                        src={item[imgKey].startsWith('http') ? item[imgKey] : `${import.meta.env.BASE_URL}images/${item[imgKey]}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        data-dock-type="media" 
                        data-dock-bind={`${sectionName}.${index}.${imgKey}`} 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                     {linkKey && (
                        <a 
                            href={typeof item[linkKey] === 'object' ? item[linkKey].url : (item[linkKey] || "#")} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white text-primary px-6 py-2 rounded-full font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                        >
                            Bekijk Project
                        </a>
                     )}
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-8 flex-1 flex flex-col">
                  {fieldsToRender.map((fk, fIdx) => {
                      const isTitle = fIdx === 0;
                      const isCategory = fk.toLowerCase().includes('cat') || fk.toLowerCase().includes('type');
                      const val = item[fk];
                      const displayText = typeof val === 'object' ? (val.text || val.label || val.title || JSON.stringify(val)) : val;
                      
                      if (isCategory) {
                        return (
                            <span key={fk} className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-3">
                                <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                            </span>
                        );
                      }

                      return (
                        <div key={fk} className={`${isTitle ? 'text-2xl font-bold text-primary mb-4 leading-tight' : 'text-slate-500 text-sm leading-relaxed mb-4 flex-1'}`}>
                            <span data-dock-type="text" data-dock-bind={`${sectionName}.${index}.${fk}`}>{displayText}</span>
                        </div>
                      );
                  })}
                  
                  <div className="pt-6 border-t border-slate-50 mt-auto">
                    <button 
                        className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 group/btn"
                        onClick={() => {
                            const url = typeof item[linkKey] === 'object' ? item[linkKey].url : (item[linkKey] || "#");
                            if (url !== "#") window.open(url, '_blank');
                        }}
                    >
                        Project Details 
                        <i className="fa-solid fa-arrow-right-long transition-transform group-hover/btn:translate-x-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- ARCHIVE SECTION --- */}
        <div className="mt-20 flex flex-col items-center">
          <button
            onClick={fetchArchive}
            disabled={loading}
            className={`
              group relative px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500
              ${showArchive ? 'bg-primary text-white shadow-2xl scale-105' : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white shadow-xl'}
            `}
          >
            <span className="relative z-10 flex items-center gap-3">
              {loading ? 'Laden...' : (showArchive ? 'Sluit Archief' : 'Volledige Lijst / Archief')}
              {!loading && <i className={`fa-solid ${showArchive ? 'fa-xmark' : 'fa-box-archive'}`}></i>}
            </span>
          </button>

          {showArchive && archiveData.length > 0 && (
            <div className="mt-16 w-full animate-reveal">
              <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-50">
                        <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Type</th>
                        <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Project</th>
                        <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Omschrijving</th>
                        <th className="py-6 px-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archiveData.map((project, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                          <td className="py-6 px-4">
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-bold uppercase text-slate-500">
                              {project.type || 'website'}
                            </span>
                          </td>
                          <td className="py-6 px-4">
                            <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors block">
                              <h4 className="font-bold text-primary text-lg">{project.name}</h4>
                            </a>
                          </td>
                          <td className="py-6 px-4">
                            <p className="text-slate-600 font-light italic line-clamp-1 text-sm">{project.description}</p>
                          </td>
                          <td className="py-6 px-4 text-right">
                            <div className="flex justify-end gap-4">
                              {project.githubLink && (
                                <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-primary transition-colors" title="GitHub">
                                  <i className="fa-brands fa-github text-xl"></i>
                                </a>
                              )}
                              {project.liveLink && (
                                <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-accent transition-colors" title="Live Site">
                                  <i className="fa-solid fa-arrow-up-right-from-square text-lg"></i>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
