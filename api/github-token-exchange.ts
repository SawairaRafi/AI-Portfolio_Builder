
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'; // Vercel provides node-fetch in its Node.js runtime.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed', error_description: 'This endpoint only accepts POST requests.' });
  }

  const { code, codeVerifier } = req.body;

  // --- Environment Variables - CRITICAL for Backend Security ---
  // These MUST be set in your Vercel project's environment variables, NOT hardcoded.
  const GITHUB_CLIENT_ID = process.env.MY_APP_GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.MY_APP_GITHUB_CLIENT_SECRET; 
  // This callback URL is used by GitHub for verification during the token exchange.
  // It should match the redirect_uri used when initiating the OAuth flow AND what's in your GitHub App settings.
  const GITHUB_CALLBACK_URL = process.env.MY_APP_GITHUB_CALLBACK_URL; 

  if (!code || !codeVerifier) {
    return res.status(400).json({ error: 'bad_request', error_description: 'Missing authorization code or PKCE verifier.' });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
    console.error("Server misconfiguration: Missing GitHub OAuth environment variables on the backend.");
    return res.status(500).json({ error: 'server_error', error_description: 'Server configuration error. Cannot process GitHub authentication.' });
  }

  const params = new URLSearchParams();
  params.append('client_id', GITHUB_CLIENT_ID);
  params.append('client_secret', GITHUB_CLIENT_SECRET);
  params.append('code', code as string);
  params.append('redirect_uri', GITHUB_CALLBACK_URL); 
  params.append('grant_type', 'authorization_code');
  params.append('code_verifier', codeVerifier as string);

  try {
    const ghResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data: any = await ghResponse.json(); // Type as any to handle potential error structures

    if (!ghResponse.ok) {
      console.error('GitHub token exchange error from GitHub API:', data);
      // Forward GitHub's error message if available
      return res.status(ghResponse.status).json(data || { 
        error: 'github_api_error', 
        error_description: `GitHub API responded with status ${ghResponse.status}. ${data?.error_description || data?.error || data?.message || ghResponse.statusText || 'Unknown error from GitHub.'}`,
      });
    }
    
    // Successfully exchanged token, send the data from GitHub back to the frontend
    return res.status(200).json(data); // Contains access_token, scope, token_type etc.

  } catch (error: any) {
    console.error('Internal server error in backend proxy during token exchange:', error);
    return res.status(500).json({ 
      error: 'internal_server_error', 
      error_description: 'The backend proxy encountered an unexpected issue while contacting GitHub.',
      details: error.message 
    });
  }
}
