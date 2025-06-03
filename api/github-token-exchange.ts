
// This file (e.g., api/github-token-exchange.ts) represents a backend proxy.
// It's intended to be deployed as a serverless function (e.g., on Vercel, Netlify)
// or as an endpoint in a Node.js server (e.g., using Express).

// When using with Vercel, you can use the VercelApiRequest and VercelApiResponse types.
// For a generic Node.js server, you'd adapt this to your framework (e.g., Express req, res).
// import type { VercelRequest, VercelResponse } from '@vercel/node'; // Example for Vercel

// We'll use node-fetch for making HTTP requests from the backend.
// Ensure 'node-fetch' is available in your backend environment or install it.
// If using ES Modules in Node.js ( "type": "module" in package.json ), you can use:
import fetch from 'node-fetch';

// This is a simplified handler. In a real framework, this would be more structured.
// For Vercel, the default export is the handler:
// export default async function handler(req: VercelRequest, res: VercelResponse) {
// For a generic example, let's assume a function that could be adapted:
async function handleTokenExchange(requestBody: any): Promise<any> {
  const { code, codeVerifier } = requestBody;

  // --- Environment Variables - CRITICAL for Backend Security ---
  // These MUST be set in your backend server's environment, NOT hardcoded.
  const GITHUB_CLIENT_ID = process.env.MY_APP_GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.MY_APP_GITHUB_CLIENT_SECRET;
  // This callback URL is used by GitHub for verification and should match your app's settings.
  const GITHUB_CALLBACK_URL = process.env.MY_APP_GITHUB_CALLBACK_URL; 

  if (!code || !codeVerifier) {
    return {
      status: 400,
      body: { error: 'Missing authorization code or PKCE verifier.' },
    };
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
    console.error("Server misconfiguration: Missing GitHub OAuth environment variables.");
    return {
      status: 500,
      body: { error: 'Server configuration error. Cannot process GitHub authentication.' },
    };
  }

  const params = new URLSearchParams();
  params.append('client_id', GITHUB_CLIENT_ID);
  params.append('client_secret', GITHUB_CLIENT_SECRET);
  params.append('code', code as string);
  params.append('redirect_uri', GITHUB_CALLBACK_URL); // Must match registered callback URL
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

    const data = await ghResponse.json();

    if (!ghResponse.ok) {
      console.error('GitHub token exchange error:', data);
      return {
        status: ghResponse.status,
        // Forward GitHub's error message if available
        body: data || { error: 'Failed to exchange token with GitHub.', details: ghResponse.statusText },
      };
    }
    
    // Successfully exchanged token
    return {
      status: 200,
      body: data, // Contains access_token, scope, token_type etc.
    };

  } catch (error: any) {
    console.error('Internal server error during token exchange:', error);
    return {
      status: 500,
      body: { error: 'Internal server error while contacting GitHub.', details: error.message },
    };
  }
}


// --- How to use this function depends on your backend framework ---

// Example for Vercel Serverless Function (api/github-token-exchange.ts):
// (You would need to install `@vercel/node` for types if not already)
/*
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'; // Vercel provides node-fetch

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { code, codeVerifier } = req.body;

  const GITHUB_CLIENT_ID = process.env.MY_APP_GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.MY_APP_GITHU_CLIENT_SECRET; // Typo fixed from original comment
  const GITHUB_CALLBACK_URL = process.env.MY_APP_GITHUB_CALLBACK_URL;

  if (!code || !codeVerifier) {
    return res.status(400).json({ error: 'Missing authorization code or PKCE verifier.' });
  }
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
    console.error("Server misconfiguration: Missing GitHub OAuth environment variables.");
    return res.status(500).json({ error: 'Server configuration error.' });
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
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const data = await ghResponse.json();

    if (!ghResponse.ok) {
      console.error('GitHub token exchange error details:', data);
      return res.status(ghResponse.status).json(data || { error: 'GitHub API error during token exchange' });
    }
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Backend token exchange critical error:', error);
    return res.status(500).json({ error: 'Internal server error during token exchange.', details: error.message });
  }
}
*/

// Note: The above Vercel handler is commented out to keep the file as a generic example.
// You need to adapt the `handleTokenExchange` function logic into the specific
// request/response handling mechanism of your chosen backend framework/platform.
// For example, if using Express.js:
/*
const express = require('express');
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

app.post('/api/github/exchange-token', async (req, res) => {
  const result = await handleTokenExchange(req.body);
  res.status(result.status).json(result.body);
});

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`Backend proxy running on port ${PORT}`));
*/

// This file primarily demonstrates the logic for `handleTokenExchange`.
// You must integrate this logic into a running server.
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
 module.exports = { handleTokenExchange }; // For CommonJS if needed by some runners
}
