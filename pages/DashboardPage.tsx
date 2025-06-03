
// import React, { useState, useCallback, ChangeEvent } from 'react';
// import { PortfolioData, GitHubUser, GeneratedPortfolioContent, Project, Experience, SocialLink } from '../types';
// import UserInputForm from '../components/UserInputForm';
// import PortfolioPreview from '../components/PortfolioPreview';
// import { geminiService } from '../services/geminiService';
// import { githubService } from '../services/githubService';
// import LoadingSpinner from '../components/LoadingSpinner';
// import Modal from '../components/Modal';
// import { DEFAULT_REPO_NAME_PREFIX } from '../constants';

// interface DashboardPageProps {
//   portfolioData: PortfolioData;
//   setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData>>;
//   githubToken: string;
//   githubUser: GitHubUser;
// }

// const DashboardPage: React.FC<DashboardPageProps> = ({ portfolioData, setPortfolioData, githubToken, githubUser }) => {
//   const [isLoadingAi, setIsLoadingAi] = useState(false);
//   const [isLoadingPublish, setIsLoadingPublish] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [generatedContent, setGeneratedContent] = useState<GeneratedPortfolioContent | null>(null);
//   const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalTitle, setModalTitle] = useState('');
//   const [modalContent, setModalContent] = useState('');
//   const [repoName, setRepoName] = useState(`${DEFAULT_REPO_NAME_PREFIX}${githubUser.login}-${Date.now().toString().slice(-5)}`);


//   const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setPortfolioData(prev => ({ ...prev, [name]: value }));
//   }, [setPortfolioData]);

//   const handleArrayChange = <T extends Project | Experience | SocialLink,>(
//     section: keyof PortfolioData, 
//     index: number, 
//     field: keyof T, 
//     value: string
//   ) => {
//     setPortfolioData(prev => {
//       const newArray = [...(prev[section] as T[])];
//       newArray[index] = { ...newArray[index], [field]: value };
//       return { ...prev, [section]: newArray };
//     });
//   };

//   const addArrayItem = <T extends Project | Experience | SocialLink,>(section: keyof PortfolioData, newItem: T) => {
//     setPortfolioData(prev => ({
//       ...prev,
//       [section]: [...(prev[section] as T[]), newItem]
//     }));
//   };

//   const removeArrayItem = (section: keyof PortfolioData, index: number) => {
//     setPortfolioData(prev => ({
//       ...prev,
//       [section]: (prev[section] as Array<Project | Experience | SocialLink>).filter((_, i) => i !== index)
//     }));
//   };
  
//   const handleSkillsChange = (newSkills: string[]) => {
//     setPortfolioData(prev => ({ ...prev, skills: newSkills }));
//   };


//   const handleGenerateWithAI = async () => {
//     if (!geminiService.isConfigured()) {
//       setError("Gemini API key is not configured. AI features are disabled.");
//       setModalTitle("AI Error");
//       setModalContent("Gemini API key is not configured. Please check application setup. AI features are currently disabled.");
//       setIsModalOpen(true);
//       return;
//     }
//     setIsLoadingAi(true);
//     setError(null);
//     try {
//       const content = await geminiService.generatePortfolioContent(portfolioData);
//       setGeneratedContent(content);
//       // Optionally update portfolioData with AI suggestions, e.g., bio
//       setPortfolioData(prev => ({...prev, bio: content.enhancedBio}));
//       setModalTitle("AI Content Generated");
//       setModalContent("AI has successfully enhanced your portfolio content! You can see the suggestions in the preview and bio field.");
//       setIsModalOpen(true);
//     } catch (err) {
//       console.error(err);
//       setError((err as Error).message || "Failed to generate AI content.");
//       setModalTitle("AI Error");
//       setModalContent(`Failed to generate AI content: ${(err as Error).message}`);
//       setIsModalOpen(true);
//     } finally {
//       setIsLoadingAi(false);
//     }
//   };
  
//   const generatePortfolioHTML = (data: PortfolioData, aiContent: GeneratedPortfolioContent | null): string => {
//     const finalBio = aiContent?.enhancedBio || data.bio;
//     const finalSkills = aiContent?.skillsKeywords || data.skills;
    
//     const projectHTML = data.projects.map(p => {
//       const summary = aiContent?.projectSummaries.find(s => s.name === p.name)?.summary || p.description;
//       return `
//         <div class="project-item">
//           <h3>${p.name}</h3>
//           <p>${summary}</p>
//           ${p.url ? `<p><a href="${p.url}" target="_blank" rel="noopener noreferrer">View Project</a></p>` : ''}
//           ${p.repoUrl ? `<p><a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer">View Repository</a></p>` : ''}
//         </div>
//       `;
//     }).join('');

//     const experienceHTML = data.experience.map(e => `
//       <div class="experience-item">
//         <h3>${e.role} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})</h3>
//         <p>${e.description}</p>
//       </div>
//     `).join('');

//     const socialLinksHTML = data.socialLinks.map(sl => `
//       <li><a href="${sl.url}" target="_blank" rel="noopener noreferrer">${sl.platform}</a></li>
//     `).join('');

//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>${data.name}'s Portfolio</title>
//         <style>
//           body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
//           .container { max-width: 960px; margin: auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
//           header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
//           header h1 { margin: 0; color: #333; }
//           header h2 { margin: 5px 0; color: #555; font-weight: normal; }
//           section { margin-bottom: 20px; }
//           h3 { color: #444; }
//           ul { list-style-type: disc; padding-left: 20px; }
//           .skills-list li { display: inline-block; background-color: #e0e0e0; color: #333; padding: 5px 10px; margin: 5px 5px 5px 0; border-radius: 5px; }
//           .project-item, .experience-item { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dotted #eee; }
//           .project-item:last-child, .experience-item:last-child { border-bottom: none; }
//           a { color: #007bff; text-decoration: none; }
//           a:hover { text-decoration: underline; }
//           footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <header>
//             <h1>${data.name}</h1>
//             <h2>${data.title}</h2>
//           </header>
//           <section id="bio">
//             <h3>About Me</h3>
//             <p>${finalBio.replace(/\n/g, '<br>')}</p>
//           </section>
//           <section id="skills">
//             <h3>Skills</h3>
//             <ul class="skills-list">${finalSkills.map(s => `<li>${s}</li>`).join('')}</ul>
//           </section>
//           <section id="projects">
//             <h3>Projects</h3>
//             ${projectHTML}
//           </section>
//           <section id="experience">
//             <h3>Experience</h3>
//             ${experienceHTML}
//           </section>
//           <section id="social">
//             <h3>Connect With Me</h3>
//             <ul>${socialLinksHTML}</ul>
//           </section>
//           <footer>
//             <p>Portfolio generated by AI Portfolio Builder.</p>
//           </footer>
//         </div>
//       </body>
//       </html>
//     `;
//   };

//   const handlePublishToGitHub = async () => {
//     if (!repoName.trim()) {
//         setError("Repository name cannot be empty.");
//         setModalTitle("Publish Error");
//         setModalContent("Please enter a valid repository name.");
//         setIsModalOpen(true);
//         return;
//     }

//     setIsLoadingPublish(true);
//     setError(null);
//     setPublishedUrl(null);

//     try {
//       // 1. Create repository
//       let ghRepo;
//       try {
//         ghRepo = await githubService.createRepo(githubToken, repoName, `Portfolio for ${portfolioData.name}`);
//       } catch (repoError: any) {
//         // If repo already exists, this might fail. Could try to get repo instead.
//         // For simplicity, we assume creation or fail.
//         // A more robust solution would check if repo exists and if user wants to overwrite.
//         if (repoError.message && repoError.message.toLowerCase().includes("name already exists")) {
//              setError(`Repository '${repoName}' already exists on your GitHub. Please choose a different name or manage the existing repository manually.`);
//              setModalTitle("Publish Error");
//              setModalContent(`Repository '${repoName}' already exists on your GitHub. Please choose a different name or manage the existing repository manually.`);
//              setIsModalOpen(true);
//              setIsLoadingPublish(false);
//              return;
//         }
//         throw repoError; // Re-throw other repo creation errors
//       }

//       const owner = ghRepo.owner.login;
//       const repo = ghRepo.name;
//       const ghPagesBranch = "gh-pages";

//       // 2. Ensure gh-pages branch exists. Create it from default branch if not.
//       let ghPagesBranchExists = await githubService.getBranch(githubToken, owner, repo, ghPagesBranch);
//       if (!ghPagesBranchExists) {
//           const defaultBranchSha = await githubService.getDefaultBranchSha(githubToken, owner, repo);
//           await githubService.createBranch(githubToken, owner, repo, ghPagesBranch, defaultBranchSha);
//       }
      
//       // 3. Generate HTML content
//       const htmlContent = generatePortfolioHTML(portfolioData, generatedContent);
//       const filePath = "index.html";
//       const commitMessage = "Deploy portfolio from AI Portfolio Builder";

//       // 4. Check if index.html exists to get SHA for update, otherwise create new
//       const existingFile = await githubService.getRepoContent(githubToken, owner, repo, filePath, ghPagesBranch);
      
//       // 5. Create or update index.html on gh-pages branch
//       await githubService.createOrUpdateFile(
//         githubToken,
//         owner,
//         repo,
//         filePath,
//         htmlContent,
//         commitMessage,
//         ghPagesBranch,
//         existingFile?.sha
//       );

//       // 6. Enable GitHub Pages
//       await githubService.enableGitHubPages(githubToken, owner, repo, ghPagesBranch);
      
//       const siteUrl = `https://${owner}.github.io/${repo}/`;
//       setPublishedUrl(siteUrl);
//       setModalTitle("Successfully Published!");
//       setModalContent(`Your portfolio is now live at: <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">${siteUrl}</a>. It may take a few minutes for GitHub Pages to fully deploy.`);
//       setIsModalOpen(true);

//     } catch (err) {
//       console.error(err);
//       const errorMessage = (err as Error).message || "Failed to publish portfolio to GitHub Pages.";
//       setError(errorMessage);
//       setModalTitle("Publish Error");
//       setModalContent(`Failed to publish: ${errorMessage}`);
//       setIsModalOpen(true);
//     } finally {
//       setIsLoadingPublish(false);
//     }
//   };

//   const handleDownloadZip = () => {
//     const htmlContent = generatePortfolioHTML(portfolioData, generatedContent);
//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'portfolio.html'; // Simplified: just HTML. For a zip, would need JSZip or similar.
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(link.href);

//     setModalTitle("Download Started");
//     setModalContent("Your portfolio HTML file has been prepared for download.");
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="space-y-8">
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
//         <div dangerouslySetInnerHTML={{ __html: modalContent }} />
//       </Modal>

//       <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
//         <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Welcome, {githubUser.name || githubUser.login}!</h2>
//         <p className="text-slate-600 dark:text-slate-300">Fill in your details below to build your portfolio. Use the AI assistant to enhance your content.</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
//           <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Portfolio Details</h3>
//           <UserInputForm 
//             portfolioData={portfolioData} 
//             onInputChange={handleInputChange}
//             onArrayChange={handleArrayChange}
//             onAddArrayItem={addArrayItem}
//             onRemoveArrayItem={removeArrayItem}
//             onSkillsChange={handleSkillsChange}
//           />
//         </div>
//         <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
//           <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Live Preview</h3>
//           <PortfolioPreview data={portfolioData} aiContent={generatedContent} />
//         </div>
//       </div>

//       <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow space-y-4">
//         <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Actions</h3>
//         {error && <p className="text-red-500">{error}</p>}
//         <button
//           onClick={handleGenerateWithAI}
//           disabled={isLoadingAi || !geminiService.isConfigured()}
//           className="w-full sm:w-auto px-6 py-2 bg-secondary-500 hover:bg-secondary-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-400 disabled:opacity-50 flex items-center justify-center"
//         >
//           {isLoadingAi && <LoadingSpinner size={5} color="text-white mr-2" />}
//           {geminiService.isConfigured() ? 'Enhance with AI ✨' : 'AI Disabled (No API Key)'}
//         </button>
        
//         <div className="space-y-2">
//             <label htmlFor="repoName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
//               GitHub Repository Name:
//             </label>
//             <input
//               type="text"
//               id="repoName"
//               name="repoName"
//               value={repoName}
//               onChange={(e) => setRepoName(e.target.value)}
//               className="mt-1 block w-full sm:w-1/2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//               placeholder="e.g., my-awesome-portfolio"
//             />
//         </div>

//         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
//           <button
//             onClick={handlePublishToGitHub}
//             disabled={isLoadingPublish}
//             className="w-full sm:w-auto px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center"
//           >
//             {isLoadingPublish && <LoadingSpinner size={5} color="text-white mr-2" />}
//             Publish to GitHub Pages 🚀
//           </button>
//           <button
//             onClick={handleDownloadZip}
//             className="w-full sm:w-auto px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
//           >
//             Download Portfolio HTML 💾
//           </button>
//         </div>
//         {publishedUrl && (
//           <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded">
//             Successfully published! Your site is available at: <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">{publishedUrl}</a>
//             <p className="text-sm">Note: It might take a few minutes for changes to go live on GitHub Pages.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;

import React, { useState, useCallback, ChangeEvent } from 'react';
import { PortfolioData, GitHubUser, GeneratedPortfolioContent, Project, Experience, SocialLink } from '../types';
import UserInputForm from '../components/UserInputForm';
import PortfolioPreview from '../components/PortfolioPreview';
import { geminiService } from '../services/geminiService';
import { openAIService } from '../services/openAIService'; // Added OpenAI service
import { githubService } from '../services/githubService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { DEFAULT_REPO_NAME_PREFIX } from '../constants';

interface DashboardPageProps {
  portfolioData: PortfolioData;
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  githubToken: string;
  githubUser: GitHubUser;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ portfolioData, setPortfolioData, githubToken, githubUser }) => {
  const [isLoadingAi, setIsLoadingAi] = useState(false); // For Gemini
  const [isLoadingOpenAi, setIsLoadingOpenAi] = useState(false); // For OpenAI
  const [isLoadingPublish, setIsLoadingPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedPortfolioContent | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [repoName, setRepoName] = useState(`${DEFAULT_REPO_NAME_PREFIX}${githubUser.login}-${Date.now().toString().slice(-5)}`);


  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPortfolioData(prev => ({ ...prev, [name]: value }));
  }, [setPortfolioData]);

  const handleArrayChange = <T extends Project | Experience | SocialLink,>(
    section: keyof PortfolioData, 
    index: number, 
    field: keyof T, 
    value: string
  ) => {
    setPortfolioData(prev => {
      const newArray = [...(prev[section] as T[])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const addArrayItem = <T extends Project | Experience | SocialLink,>(section: keyof PortfolioData, newItem: T) => {
    setPortfolioData(prev => ({
      ...prev,
      [section]: [...(prev[section] as T[]), newItem]
    }));
  };

  const removeArrayItem = (section: keyof PortfolioData, index: number) => {
    setPortfolioData(prev => ({
      ...prev,
      [section]: (prev[section] as Array<Project | Experience | SocialLink>).filter((_, i) => i !== index)
    }));
  };
  
  const handleSkillsChange = (newSkills: string[]) => {
    setPortfolioData(prev => ({ ...prev, skills: newSkills }));
  };


  const handleGenerateWithGemini = async () => {
    if (!geminiService.isConfigured()) {
      setError("Gemini API key is not configured. AI features are disabled.");
      setModalTitle("AI Error (Gemini)");
      setModalContent("Gemini API key is not configured. Please check application setup. AI features are currently disabled.");
      setIsModalOpen(true);
      return;
    }
    setIsLoadingAi(true);
    setError(null);
    try {
      const content = await geminiService.generatePortfolioContent(portfolioData);
      setGeneratedContent(content);
      // Optionally update portfolioData with AI suggestions, e.g., bio
      setPortfolioData(prev => ({...prev, bio: content.enhancedBio}));
      setModalTitle("AI Content Generated (Gemini)");
      setModalContent("Gemini AI has successfully enhanced your portfolio content! You can see the suggestions in the preview and bio field.");
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Failed to generate AI content with Gemini.");
      setModalTitle("AI Error (Gemini)");
      setModalContent(`Failed to generate AI content with Gemini: ${(err as Error).message}`);
      setIsModalOpen(true);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleGenerateWithOpenAI = async () => {
    if (!openAIService.isConfigured()) {
      setError("OpenAI API key is not configured. OpenAI features are disabled.");
      setModalTitle("AI Error (OpenAI)");
      setModalContent("OpenAI API key is not configured. Please check application setup. OpenAI features are currently disabled.");
      setIsModalOpen(true);
      return;
    }
    setIsLoadingOpenAi(true);
    setError(null);
    try {
      const content = await openAIService.generatePortfolioContentWithOpenAI(portfolioData);
      setGeneratedContent(content);
      // Optionally update portfolioData with AI suggestions, e.g., bio
      setPortfolioData(prev => ({...prev, bio: content.enhancedBio}));
      setModalTitle("AI Content Generated (OpenAI)");
      setModalContent("OpenAI has successfully enhanced your portfolio content! You can see the suggestions in the preview and bio field.");
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Failed to generate AI content with OpenAI.");
      setModalTitle("AI Error (OpenAI)");
      setModalContent(`Failed to generate AI content with OpenAI: ${(err as Error).message}`);
      setIsModalOpen(true);
    } finally {
      setIsLoadingOpenAi(false);
    }
  };
  
  const generatePortfolioHTML = (data: PortfolioData, aiContent: GeneratedPortfolioContent | null): string => {
    const finalBio = aiContent?.enhancedBio || data.bio;
    const finalSkills = aiContent?.skillsKeywords || data.skills;
    
    const projectHTML = data.projects.map(p => {
      const summary = aiContent?.projectSummaries.find(s => s.name === p.name)?.summary || p.description;
      return `
        <div class="project-item">
          <h3>${p.name}</h3>
          <p>${summary}</p>
          ${p.url ? `<p><a href="${p.url}" target="_blank" rel="noopener noreferrer">View Project</a></p>` : ''}
          ${p.repoUrl ? `<p><a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer">View Repository</a></p>` : ''}
        </div>
      `;
    }).join('');

    const experienceHTML = data.experience.map(e => `
      <div class="experience-item">
        <h3>${e.role} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})</h3>
        <p>${e.description}</p>
      </div>
    `).join('');

    const socialLinksHTML = data.socialLinks.map(sl => `
      <li><a href="${sl.url}" target="_blank" rel="noopener noreferrer">${sl.platform}</a></li>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.name}'s Portfolio</title>
        <style>
          body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
          .container { max-width: 960px; margin: auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
          header h1 { margin: 0; color: #333; }
          header h2 { margin: 5px 0; color: #555; font-weight: normal; }
          section { margin-bottom: 20px; }
          h3 { color: #444; }
          ul { list-style-type: disc; padding-left: 20px; }
          .skills-list li { display: inline-block; background-color: #e0e0e0; color: #333; padding: 5px 10px; margin: 5px 5px 5px 0; border-radius: 5px; }
          .project-item, .experience-item { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dotted #eee; }
          .project-item:last-child, .experience-item:last-child { border-bottom: none; }
          a { color: #007bff; text-decoration: none; }
          a:hover { text-decoration: underline; }
          footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>${data.name}</h1>
            <h2>${data.title}</h2>
          </header>
          <section id="bio">
            <h3>About Me</h3>
            <p>${finalBio.replace(/\n/g, '<br>')}</p>
          </section>
          <section id="skills">
            <h3>Skills</h3>
            <ul class="skills-list">${finalSkills.map(s => `<li>${s}</li>`).join('')}</ul>
          </section>
          <section id="projects">
            <h3>Projects</h3>
            ${projectHTML}
          </section>
          <section id="experience">
            <h3>Experience</h3>
            ${experienceHTML}
          </section>
          <section id="social">
            <h3>Connect With Me</h3>
            <ul>${socialLinksHTML}</ul>
          </section>
          <footer>
            <p>Portfolio generated by AI Portfolio Builder.</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  };

  const handlePublishToGitHub = async () => {
    if (!repoName.trim()) {
        setError("Repository name cannot be empty.");
        setModalTitle("Publish Error");
        setModalContent("Please enter a valid repository name.");
        setIsModalOpen(true);
        return;
    }

    setIsLoadingPublish(true);
    setError(null);
    setPublishedUrl(null);

    try {
      // 1. Create repository
      let ghRepo;
      try {
        ghRepo = await githubService.createRepo(githubToken, repoName, `Portfolio for ${portfolioData.name}`);
      } catch (repoError: any) {
        // If repo already exists, this might fail. Could try to get repo instead.
        // For simplicity, we assume creation or fail.
        // A more robust solution would check if repo exists and if user wants to overwrite.
        if (repoError.message && repoError.message.toLowerCase().includes("name already exists")) {
             setError(`Repository '${repoName}' already exists on your GitHub. Please choose a different name or manage the existing repository manually.`);
             setModalTitle("Publish Error");
             setModalContent(`Repository '${repoName}' already exists on your GitHub. Please choose a different name or manage the existing repository manually.`);
             setIsModalOpen(true);
             setIsLoadingPublish(false);
             return;
        }
        throw repoError; // Re-throw other repo creation errors
      }

      const owner = ghRepo.owner.login;
      const repo = ghRepo.name;
      const ghPagesBranch = "gh-pages";

      // 2. Ensure gh-pages branch exists. Create it from default branch if not.
      let ghPagesBranchExists = await githubService.getBranch(githubToken, owner, repo, ghPagesBranch);
      if (!ghPagesBranchExists) {
          const defaultBranchSha = await githubService.getDefaultBranchSha(githubToken, owner, repo);
          await githubService.createBranch(githubToken, owner, repo, ghPagesBranch, defaultBranchSha);
      }
      
      // 3. Generate HTML content
      const htmlContent = generatePortfolioHTML(portfolioData, generatedContent);
      const filePath = "index.html";
      const commitMessage = "Deploy portfolio from AI Portfolio Builder";

      // 4. Check if index.html exists to get SHA for update, otherwise create new
      const existingFile = await githubService.getRepoContent(githubToken, owner, repo, filePath, ghPagesBranch);
      
      // 5. Create or update index.html on gh-pages branch
      await githubService.createOrUpdateFile(
        githubToken,
        owner,
        repo,
        filePath,
        htmlContent,
        commitMessage,
        ghPagesBranch,
        existingFile?.sha
      );

      // 6. Enable GitHub Pages
      await githubService.enableGitHubPages(githubToken, owner, repo, ghPagesBranch);
      
      const siteUrl = `https://${owner}.github.io/${repo}/`;
      setPublishedUrl(siteUrl);
      setModalTitle("Successfully Published!");
      setModalContent(`Your portfolio is now live at: <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">${siteUrl}</a>. It may take a few minutes for GitHub Pages to fully deploy.`);
      setIsModalOpen(true);

    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || "Failed to publish portfolio to GitHub Pages.";
      setError(errorMessage);
      setModalTitle("Publish Error");
      setModalContent(`Failed to publish: ${errorMessage}`);
      setIsModalOpen(true);
    } finally {
      setIsLoadingPublish(false);
    }
  };

  const handleDownloadZip = () => {
    const htmlContent = generatePortfolioHTML(portfolioData, generatedContent);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'portfolio.html'; // Simplified: just HTML. For a zip, would need JSZip or similar.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    setModalTitle("Download Started");
    setModalContent("Your portfolio HTML file has been prepared for download.");
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        <div dangerouslySetInnerHTML={{ __html: modalContent }} />
      </Modal>

      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Welcome, {githubUser.name || githubUser.login}!</h2>
        <p className="text-slate-600 dark:text-slate-300">Fill in your details below to build your portfolio. Use the AI assistant to enhance your content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Portfolio Details</h3>
          <UserInputForm 
            portfolioData={portfolioData} 
            onInputChange={handleInputChange}
            onArrayChange={handleArrayChange}
            onAddArrayItem={addArrayItem}
            onRemoveArrayItem={removeArrayItem}
            onSkillsChange={handleSkillsChange}
          />
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Live Preview</h3>
          <PortfolioPreview data={portfolioData} aiContent={generatedContent} />
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow space-y-4">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Actions</h3>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGenerateWithGemini}
            disabled={isLoadingAi || !geminiService.isConfigured()}
            className="w-full sm:w-auto px-6 py-2 bg-secondary-500 hover:bg-secondary-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-400 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoadingAi && <LoadingSpinner size={5} color="text-white mr-2" />}
            {geminiService.isConfigured() ? 'Enhance with Gemini ✨' : 'Gemini Disabled (No API Key)'}
          </button>
          <button
            onClick={handleGenerateWithOpenAI}
            disabled={isLoadingOpenAi || !openAIService.isConfigured()}
            className="w-full sm:w-auto px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoadingOpenAi && <LoadingSpinner size={5} color="text-white mr-2" />}
            {openAIService.isConfigured() ? 'Enhance with OpenAI 🤖' : 'OpenAI Disabled (No API Key)'}
          </button>
        </div>
        
        <div className="space-y-2">
            <label htmlFor="repoName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              GitHub Repository Name:
            </label>
            <input
              type="text"
              id="repoName"
              name="repoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="mt-1 block w-full sm:w-1/2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g., my-awesome-portfolio"
            />
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handlePublishToGitHub}
            disabled={isLoadingPublish}
            className="w-full sm:w-auto px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoadingPublish && <LoadingSpinner size={5} color="text-white mr-2" />}
            Publish to GitHub Pages 🚀
          </button>
          <button
            onClick={handleDownloadZip}
            className="w-full sm:w-auto px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Download Portfolio HTML 💾
          </button>
        </div>
        {publishedUrl && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded">
            Successfully published! Your site is available at: <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">{publishedUrl}</a>
            <p className="text-sm">Note: It might take a few minutes for changes to go live on GitHub Pages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;