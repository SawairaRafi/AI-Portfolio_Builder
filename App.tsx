
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { GitHubUser, PortfolioData } from './types';
import { authService } from './services/authService';
import { githubService } from './services/githubService';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import { SESSION_STORAGE_GITHUB_TOKEN_KEY } from './constants';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [githubToken, setGitHubToken] = useState<string | null>(null);
  const [githubUser, setGitHubUser] = useState<GitHubUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Portfolio data state
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    name: '',
    title: '',
    bio: '',
    skills: [],
    projects: [],
    experience: [],
    socialLinks: [],
  });

  const navigate = useNavigate();
  const location = useLocation();

  const fetchGitHubUser = useCallback(async (token: string) => {
    try {
      const user = await githubService.getUserProfile(token);
      setGitHubUser(user);
      setAuthError(null);
    } catch (error) {
      console.error("Failed to fetch GitHub user:", error);
      setAuthError("Failed to fetch GitHub user profile. Please try logging in again.");
      setGitHubToken(null); // Invalidate token if user fetch fails
      setGitHubUser(null);
      sessionStorage.removeItem(SESSION_STORAGE_GITHUB_TOKEN_KEY);
    }
  }, []);

  const handleGitHubLogin = async () => {
    setAuthError(null); // Clear previous auth errors
    try {
      // authService.loginWithGitHub is async due to PKCE challenge generation
      // and now includes a pre-check for CLIENT_ID configuration.
      await authService.loginWithGitHub();
    } catch (error: any) {
      console.error("GitHub login initiation error:", error);
      setAuthError(error.message || "Failed to initiate GitHub login. Check console and configuration.");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setGitHubToken(null);
    setGitHubUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_GITHUB_TOKEN_KEY);
    setAuthError(null); // Clear any auth errors on logout
    navigate('/');
  };

  // Effect to handle GitHub OAuth callback
  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        setIsLoading(true);
        setAuthError(null); // Clear previous auth errors
        try {
          const token = await authService.handleGitHubCallback(code, state);
          if (token) {
            setGitHubToken(token);
            await fetchGitHubUser(token);
            // Navigate to dashboard, ensuring URL is cleaned of OAuth params
            navigate('/dashboard', { replace: true }); 
          } else {
            // This case should ideally be handled by an error thrown in handleGitHubCallback
            setAuthError("Failed to obtain GitHub token. Token was null.");
          }
        } catch (error: any) {
          console.error("GitHub OAuth callback error:", error);
          setAuthError(error.message || "An error occurred during GitHub authentication. This might be due to network issues, incorrect OAuth configuration, or GitHub's server restrictions for direct client-side token exchange (a backend proxy might be needed).");
        } finally {
          // Clean up URL query parameters regardless of outcome, if on the callback path
          if (window.location.search.includes("code=") || window.location.search.includes("state=")) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split("?")[0]);
          }
          setIsLoading(false);
        }
      } else {
        // Check for existing token in session storage (e.g. after page refresh)
        const storedToken = sessionStorage.getItem(SESSION_STORAGE_GITHUB_TOKEN_KEY);
        if (storedToken && !githubToken) { // Only if not already set
          setGitHubToken(storedToken);
          // fetchGitHubUser will be called by the useEffect depending on githubToken
        }
        setIsLoading(false); // Done with initial load/callback check
      }
    };
    
    // Only run processCallback if not already authenticated from session or if it's a new callback
    if (!githubToken || (window.location.search.includes("code=") && window.location.search.includes("state="))) {
        processCallback();
    } else {
        setIsLoading(false); // Already authenticated or no callback, finish loading
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount or if navigating back with code/state


  // Effect to fetch user data if token exists but user data doesn't (e.g., from session storage)
  useEffect(() => {
    if (githubToken && !githubUser && !isLoading) { // ensure not still loading from callback
        setIsLoading(true);
        fetchGitHubUser(githubToken).finally(() => setIsLoading(false));
    }
  }, [githubToken, githubUser, fetchGitHubUser, isLoading]);


  useEffect(() => {
    // If already logged in (token and user exist) and on home page, redirect to dashboard
    if (githubToken && githubUser && location.pathname === '/') {
        navigate('/dashboard', { replace: true });
    }
  }, [githubToken, githubUser, location.pathname, navigate]);


  if (isLoading && !authError) { // Show loader only if no immediate auth error is present
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><LoadingSpinner size={16} /></div>;
  }

  return (
    <div className={`flex flex-col min-h-screen ${theme}`}>
      <Header
        githubUser={githubUser}
        onLogin={handleGitHubLogin}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Authentication Error: </strong>
            <span className="block sm:inline">{authError}</span>
            <button onClick={() => setAuthError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Dismiss error">
              <span className="text-xl">×</span>
            </button>
          </div>
        )}
        <Routes>
          <Route path="/" element={
            githubToken && githubUser ? <DashboardPage portfolioData={portfolioData} setPortfolioData={setPortfolioData} githubToken={githubToken} githubUser={githubUser} /> : <HomePage onLogin={handleGitHubLogin} />
          } />
          <Route path="/dashboard" element={
            githubToken && githubUser ? <DashboardPage portfolioData={portfolioData} setPortfolioData={setPortfolioData} githubToken={githubToken} githubUser={githubUser} /> : <HomePage onLogin={handleGitHubLogin} /> 
          } />
          {/* No explicit callback route needed here, handled by App.tsx useEffect based on URL params */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;