
export interface PortfolioData {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  socialLinks: SocialLink[];
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  repoUrl?: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  owner: {
    login: string;
  };
}

export interface GeneratedPortfolioContent {
  enhancedBio: string;
  projectSummaries: Array<{ name: string; summary: string }>;
  skillsKeywords: string[];
}

export enum Theme {
  Light = "light",
  Dark = "dark",
}
