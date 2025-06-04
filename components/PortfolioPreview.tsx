
import React from 'react';
import { PortfolioData, GeneratedPortfolioContent } from '../types';

interface PortfolioPreviewProps {
  data: PortfolioData;
  aiContent: GeneratedPortfolioContent | null;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ data, aiContent }) => {
  const finalBio = aiContent?.enhancedBio || data.bio || "Your compelling bio will appear here once you fill it in or use our AI enhancer.";
  const finalSkills = aiContent?.skillsKeywords.length ? aiContent.skillsKeywords : (data.skills.length ? data.skills : ["Key skills will be listed here."]);

  return (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg h-full overflow-y-auto bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 h-[92%]">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">{data.name || "Your Name"}</h1>
        <h2 className="text-xl text-primary-600 dark:text-primary-400">{data.title || "Your Title/Role"}</h2>
      </div>

      <section className="mb-6">
        <h3 className="text-xl font-semibold border-b border-slate-300 dark:border-slate-600 pb-1 mb-2">About Me</h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{finalBio}</p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold border-b border-slate-300 dark:border-slate-600 pb-1 mb-2">Skills</h3>
        <ul className="flex flex-wrap gap-2">
          {finalSkills.map((skill, index) => (
            <li key={index} className="bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
              {skill}
            </li>
          ))}
        </ul>
      </section>

      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold border-b border-slate-300 dark:border-slate-600 pb-1 mb-2">Projects</h3>
          {data.projects.map((project, index) => {
            const summary = aiContent?.projectSummaries.find(s => s.name === project.name)?.summary || project.description;
            return (
              <div key={index} className="mb-3 pb-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                <h4 className="font-semibold text-md">{project.name || `Project ${index + 1}`}</h4>
                <p className="text-xs my-1 whitespace-pre-wrap">{summary || "Project description..."}</p>
                {project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary-500 dark:text-secondary-400 hover:underline mr-2">View Project</a>}
                {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary-500 dark:text-secondary-400 hover:underline">View Repo</a>}
              </div>
            );
          })}
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold border-b border-slate-300 dark:border-slate-600 pb-1 mb-2">Experience</h3>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-3 pb-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <h4 className="font-semibold text-md">{exp.role || `Role ${index+1}`} at {exp.company || `Company ${index+1}`}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{exp.startDate} - {exp.endDate || 'Present'}</p>
              <p className="text-xs my-1 whitespace-pre-wrap">{exp.description || "Job description..."}</p>
            </div>
          ))}
        </section>
      )}
      
      {data.socialLinks && data.socialLinks.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold border-b border-slate-300 dark:border-slate-600 pb-1 mb-2">Connect</h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {data.socialLinks.map((link, index) => (
              link.url && <li key={index} className="text-xs">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-secondary-500 dark:text-secondary-400 hover:underline">
                  {link.platform || "Link"}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
       <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>This is a live preview. Final published site may vary slightly.</p>
      </div>
    </div>
  );
};

export default PortfolioPreview;
