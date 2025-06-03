
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-800 py-6 text-center">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        © {new Date().getFullYear()} AI Portfolio Builder. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
