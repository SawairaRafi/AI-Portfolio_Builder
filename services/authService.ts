import { GITHUB_CLIENT_ID, GITHUB_CALLBACK_URL, GITHUB_SCOPES, SESSION_STORAGE_GITHUB_TOKEN_KEY, SESSION_STORAGE_PKCE_VERIFIER_KEY } from '../constants';

// Helper to generate a random string for PKCE code verifier
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Helper to generate PKCE code challenge from verifier
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  // Base64 URL encode
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const loginWithGitHub = async () => {
  // Critical check for GitHub Client ID configuration
  if (GITHUB_CLIENT_ID === "YOUR_GITHUB_CLIENT_ID" || !GITHUB_CLIENT_ID) {
    const errorMessage = "GitHub OAuth Client ID is not configured. Please replace 'YOUR_GITHUB_CLIENT_ID' in the application's configuration (e.g., constants.ts or environment variables). Login cannot proceed.";
    console.error(errorMessage);
    // This error will be caught by App.tsx's handleGitHubLogin
    throw new Error(errorMessage);
  }

  const state = generateRandomString(16);
  sessionStorage.setItem('oauth_state', state);

  const codeVerifier = generateRandomString(128);
  sessionStorage.setItem(SESSION_STORAGE_PKCE_VERIFIER_KEY, codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: GITHUB_SCOPES,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
};

const handleGitHubCallback = async (code: string, receivedState: string): Promise<string | null> => {
  const storedState = sessionStorage.getItem('oauth_state');
  if (receivedState !== storedState) {
    console.error('Invalid OAuth state');
    throw new Error('OAuth state mismatch. Potential CSRF attack.');
  }
  sessionStorage.removeItem('oauth_state');

  const codeVerifier = sessionStorage.getItem(SESSION_STORAGE_PKCE_VERIFIER_KEY);
  if (!codeVerifier) {
    console.error('PKCE code verifier not found in session storage.');
    throw new Error('PKCE code verifier is missing. Please try logging in again.');
  }
  sessionStorage.removeItem(SESSION_STORAGE_PKCE_VERIFIER_KEY);
  
  // =====================================================================================
  // !! IMPORTANT: Backend Proxy Implementation Needed !!
  // The following code calls an endpoint `/api/github/exchange-token`.
  // This endpoint MUST be implemented by YOU on a backend server you control.
  // This backend proxy is necessary to securely exchange the GitHub OAuth 'code'
  // for an 'access_token', bypassing browser CORS restrictions.
  //
  // Your backend endpoint should:
  // 1. Receive `code` and `codeVerifier` from this frontend request.
  // 2. Make a POST request to `https://github.com/login/oauth/access_token`.
  //    - Use `client_id` (from your backend's environment variables).
  //    - Use `client_secret` (from your backend's environment variables, if your GitHub App requires it).
  //    - Include the `code`, `redirect_uri` (matching your GitHub App config), `grant_type: 'authorization_code'`, and `code_verifier`.
  // 3. Parse the JSON response from GitHub.
  // 4. Return the `access_token` (and other relevant data like `scope`, `token_type`) to this frontend.
  //
  // Example (Conceptual Node.js/Express backend endpoint):
  //
  //   // In your backend server (e.g., server.js or app.js)
  //   const express = require('express');
  //   const fetch = require('node-fetch'); // or axios
  //   const app = express();
  //   app.use(express.json());
  //
  //   app.post('/api/github/exchange-token', async (req, res) => {
  //     const { code, codeVerifier } = req.body;
  //     const GITHUB_CLIENT_ID = process.env.MY_APP_GITHUB_CLIENT_ID; // From backend env
  //     const GITHUB_CLIENT_SECRET = process.env.MY_APP_GITHUB_CLIENT_SECRET; // From backend env
  //     const GITHUB_CALLBACK_URL = process.env.MY_APP_GITHUB_CALLBACK_URL; // From backend env
  //
  //     if (!code || !codeVerifier || !GITHUB_CLIENT_ID || !GITHUB_CALLBACK_URL) {
  //       return res.status(400).json({ error: 'Missing parameters or server misconfiguration.' });
  //     }
  //
  //     const params = new URLSearchParams();
  //     params.append('client_id', GITHUB_CLIENT_ID);
  //     if (GITHUB_CLIENT_SECRET) { // Include secret if your app is confidential or GitHub requires it
  //        params.append('client_secret', GITHUB_CLIENT_SECRET);
  //     }
  //     params.append('code', code);
  //     params.append('redirect_uri', GITHUB_CALLBACK_URL);
  //     params.append('grant_type', 'authorization_code');
  //     params.append('code_verifier', codeVerifier);
  //
  //     try {
  //       const ghResponse = await fetch('https://github.com/login/oauth/access_token', {
  //         method: 'POST',
  //         headers: {
  //           'Accept': 'application/json',
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //         },
  //         body: params,
  //       });
  //       const data = await ghResponse.json();
  //       if (!ghResponse.ok) {
  //         return res.status(ghResponse.status).json(data);
  //       }
  //       res.json(data); // Send { access_token, scope, token_type } back to frontend
  //     } catch (error) {
  //       console.error('Backend token exchange error:', error);
  //       res.status(500).json({ error: 'Internal server error during token exchange.' });
  //     }
  //   });
  //   // app.listen(YOUR_BACKEND_PORT, () => console.log('Backend server running...'));
  // =====================================================================================

  const proxyTokenUrl = '/api/github/exchange-token'; 
  
  try {
    const response = await fetch(proxyTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', 
      },
      body: JSON.stringify({
        code: code,
        codeVerifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error_description: 'Unknown error during token exchange via proxy.' }));
      console.error('Token exchange via proxy failed:', response.status, errorData);
      throw new Error(`GitHub token exchange via proxy failed: ${errorData.error_description || errorData.error || response.statusText}. Ensure your backend proxy at ${proxyTokenUrl} is running and correctly configured.`);
    }

    const data = await response.json();
    if (data.access_token) {
      sessionStorage.setItem(SESSION_STORAGE_GITHUB_TOKEN_KEY, data.access_token);
      return data.access_token;
    } else {
      console.error('Access token not found in proxy response:', data);
      throw new Error(`Access token not found in GitHub response via proxy. ${data.error_description || data.error || ''}`);
    }
  } catch (error) {
    console.error('Error during token exchange via proxy:', error);
    throw new Error(`Failed to exchange code for token via proxy. ${(error as Error).message || 'Network error or proxy issue. Ensure your backend proxy is reachable.'}`);
  }
};

const logout = () => {
  sessionStorage.removeItem(SESSION_STORAGE_GITHUB_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_PKCE_VERIFIER_KEY);
  sessionStorage.removeItem('oauth_state');
};

export const authService = {
  loginWithGitHub,
  handleGitHubCallback,
  logout,
};