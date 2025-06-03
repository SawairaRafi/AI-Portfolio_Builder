
import React from 'react';

interface HomePageProps {
  onLogin: () => void;
}

const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || "h-5 w-5"} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const HomePage: React.FC<HomePageProps> = ({ onLogin }) => {
  return (
    <div className="text-center py-16">
      <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
        Craft Your <span className="text-primary-600 dark:text-primary-400">Dream Portfolio</span>
      </h2>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
        Leverage the power of AI to build a stunning personal portfolio. Input your details, let our AI enhance your content, and publish directly to GitHub Pages with a few clicks.
      </p>
      <div className="mt-10">
        <button
          onClick={onLogin}
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-lg transform transition-transform hover:scale-105"
        >
          <GitHubIcon className="w-5 h-5 mr-2 -ml-1" />
          Get Started with GitHub
        </button>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Easy Data Input</h3>
          <p className="text-slate-600 dark:text-slate-300">Simply fill out forms with your professional details, projects, and experiences.</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">AI-Powered Content</h3>
          <p className="text-slate-600 dark:text-slate-300">Our AI will help you refine your bio, summarize projects, and suggest keywords.</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">One-Click Publish</h3>
          <p className="text-slate-600 dark:text-slate-300">Deploy your static portfolio site directly to your GitHub Pages.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
