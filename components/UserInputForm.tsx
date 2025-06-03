
import React, { ChangeEvent, KeyboardEvent } from 'react';
import { PortfolioData, Project, Experience, SocialLink } from '../types';

interface UserInputFormProps {
  portfolioData: PortfolioData;
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onArrayChange: <T extends Project | Experience | SocialLink>(section: keyof PortfolioData, index: number, field: keyof T, value: string) => void;
  onAddArrayItem: <T extends Project | Experience | SocialLink>(section: keyof PortfolioData, newItem: T) => void;
  onRemoveArrayItem: (section: keyof PortfolioData, index: number) => void;
  onSkillsChange: (skills: string[]) => void;
}

const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, type?: string, required?: boolean, placeholder?: string, isTextArea?: boolean}> = 
  ({label, name, value, onChange, type = "text", required = false, placeholder, isTextArea = false}) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}{required && '*'}</label>
    {isTextArea ? (
       <textarea id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={3}
       className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
    ) : (
      <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
    )}
  </div>
);

const SkillsInput: React.FC<{ skills: string[], onSkillsChange: (skills: string[]) => void }> = ({ skills, onSkillsChange }) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      if (!skills.includes(inputValue.trim())) {
        onSkillsChange([...skills, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="mb-4">
      <label htmlFor="skills" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Skills (type and press Enter or Comma)</label>
      <div className="mt-1 flex flex-wrap gap-2 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700">
        {skills.map(skill => (
          <span key={skill} className="flex items-center bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-200 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="ml-1.5 flex-shrink-0 text-primary-500 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-100">
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          id="skills"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill"
          className="flex-grow p-1 bg-transparent focus:outline-none sm:text-sm text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
};


const UserInputForm: React.FC<UserInputFormProps> = ({ portfolioData, onInputChange, onArrayChange, onAddArrayItem, onRemoveArrayItem, onSkillsChange }) => {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <InputField label="Full Name" name="name" value={portfolioData.name} onChange={onInputChange} required placeholder="e.g., Jane Doe" />
      <InputField label="Title / Role" name="title" value={portfolioData.title} onChange={onInputChange} required placeholder="e.g., Senior Software Engineer" />
      <InputField label="Bio / About Me" name="bio" value={portfolioData.bio} onChange={onInputChange} isTextArea placeholder="Tell a bit about yourself..." />
      
      <SkillsInput skills={portfolioData.skills} onSkillsChange={onSkillsChange} />

      {/* Projects Section */}
      <div>
        <h4 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-200">Projects</h4>
        {portfolioData.projects.map((project, index) => (
          <div key={index} className="p-3 mb-2 border border-slate-200 dark:border-slate-700 rounded-md space-y-2">
            <InputField label={`Project ${index + 1} Name`} name={`project-name-${index}`} value={project.name} onChange={e => onArrayChange<Project>('projects', index, 'name', e.target.value)} placeholder="Project Title"/>
            <InputField label="Description" name={`project-desc-${index}`} value={project.description} onChange={e => onArrayChange<Project>('projects', index, 'description', e.target.value)} isTextArea placeholder="Briefly describe the project"/>
            <InputField label="Project URL (Optional)" name={`project-url-${index}`} value={project.url || ''} onChange={e => onArrayChange<Project>('projects', index, 'url', e.target.value)} type="url" placeholder="https://example.com/project"/>
            <InputField label="Repository URL (Optional)" name={`project-repo-${index}`} value={project.repoUrl || ''} onChange={e => onArrayChange<Project>('projects', index, 'repoUrl', e.target.value)} type="url" placeholder="https://github.com/user/repo"/>
            <button type="button" onClick={() => onRemoveArrayItem('projects', index)} className="text-sm text-red-500 hover:text-red-700">Remove Project</button>
          </div>
        ))}
        <button type="button" onClick={() => onAddArrayItem<Project>('projects', { name: '', description: '', url: '', repoUrl: ''})} 
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline">+ Add Project</button>
      </div>

      {/* Experience Section */}
      <div>
        <h4 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-200">Experience</h4>
        {portfolioData.experience.map((exp, index) => (
          <div key={index} className="p-3 mb-2 border border-slate-200 dark:border-slate-700 rounded-md space-y-2">
            <InputField label={`Company ${index + 1}`} name={`exp-company-${index}`} value={exp.company} onChange={e => onArrayChange<Experience>('experience', index, 'company', e.target.value)} placeholder="Company Name"/>
            <InputField label="Role" name={`exp-role-${index}`} value={exp.role} onChange={e => onArrayChange<Experience>('experience', index, 'role', e.target.value)} placeholder="Your Role"/>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Start Date" name={`exp-start-${index}`} value={exp.startDate} onChange={e => onArrayChange<Experience>('experience', index, 'startDate', e.target.value)} type="month" />
                <InputField label="End Date (Optional)" name={`exp-end-${index}`} value={exp.endDate || ''} onChange={e => onArrayChange<Experience>('experience', index, 'endDate', e.target.value)} type="month" />
            </div>
            <InputField label="Description" name={`exp-desc-${index}`} value={exp.description} onChange={e => onArrayChange<Experience>('experience', index, 'description', e.target.value)} isTextArea placeholder="Describe your responsibilities and achievements"/>
            <button type="button" onClick={() => onRemoveArrayItem('experience', index)} className="text-sm text-red-500 hover:text-red-700">Remove Experience</button>
          </div>
        ))}
        <button type="button" onClick={() => onAddArrayItem<Experience>('experience', { company: '', role: '', startDate: '', endDate: '', description: ''})}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline">+ Add Experience</button>
      </div>
      
      {/* Social Links Section */}
      <div>
        <h4 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-200">Social Links</h4>
        {portfolioData.socialLinks.map((link, index) => (
          <div key={index} className="p-3 mb-2 border border-slate-200 dark:border-slate-700 rounded-md space-y-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              <label htmlFor={`social-platform-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Platform</label>
              <select id={`social-platform-${index}`} value={link.platform} onChange={e => onArrayChange<SocialLink>('socialLinks', index, 'platform', e.target.value)}
                 className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                <option value="">Select Platform</option>
                <option value="GitHub">GitHub</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter">Twitter / X</option>
                <option value="Portfolio">Personal Website</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
                <InputField label="URL" name={`social-url-${index}`} value={link.url} onChange={e => onArrayChange<SocialLink>('socialLinks', index, 'url', e.target.value)} type="url" placeholder="https://example.com/profile"/>
            </div>
            <button type="button" onClick={() => onRemoveArrayItem('socialLinks', index)} className="text-sm text-red-500 hover:text-red-700 sm:col-span-3 sm:justify-self-start">Remove Link</button>
          </div>
        ))}
        <button type="button" onClick={() => onAddArrayItem<SocialLink>('socialLinks', { platform: '', url: ''})}
                 className="text-sm text-primary-600 dark:text-primary-400 hover:underline">+ Add Social Link</button>
      </div>
    </form>
  );
};

export default UserInputForm;
