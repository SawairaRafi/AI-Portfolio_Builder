// IMPORTANT: In a real application, these should be proper environment variables.
// For GitHub OAuth, register your application on GitHub to get a Client ID.
// The callback URL must match what you configured in your GitHub OAuth App settings.

// =====================================================================================
// !! CRITICAL CONFIGURATION !!
// Replace "YOUR_GITHUB_CLIENT_ID" with your actual GitHub OAuth App Client ID.
// The application WILL NOT WORK without a valid Client ID.
// You can get this by registering an OAuth App on GitHub:
// https://github.com/settings/developers
// =====================================================================================
export const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID || "Ov23li0biwQb7Kcvh9nx"; 

// =====================================================================================
// !! CRITICAL CONFIGURATION !!
// Replace "http://localhost:5173/" with your actual callback URL.
// This URL MUST EXACTLY MATCH the "Authorization callback URL" you configured in your
// GitHub OAuth App settings (including http/https, port, and any trailing slashes).
// For local development with Vite, this is typically http://localhost:5173/.
// For other environments, adjust accordingly.
// =====================================================================================
export const GITHUB_CALLBACK_URL = process.env.REACT_APP_GITHUB_CALLBACK_URL || "http://localhost:5173/"; 
export const GITHUB_SCOPES = "repo user"; // Required scopes for creating repos and reading user info.

export const GEMINI_API_KEY = process.env.API_KEY; // This should be configured in the environment.
export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const LOCAL_STORAGE_THEME_KEY = "portfolioAppTheme";
export const SESSION_STORAGE_GITHUB_TOKEN_KEY = "githubAccessToken";
export const SESSION_STORAGE_PKCE_VERIFIER_KEY = "pkceCodeVerifier";

export const DEFAULT_REPO_NAME_PREFIX = "my-ai-portfolio-";