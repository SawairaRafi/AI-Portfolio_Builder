
// import { GitHubUser, GitHubRepo } from '../types';

// const GITHUB_API_BASE_URL = 'https://api.github.com';

// const makeGitHubRequest = async <T,>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> => {
//   const response = await fetch(`${GITHUB_API_BASE_URL}${endpoint}`, {
//     ...options,
//     headers: {
//       ...options.headers,
//       'Authorization': `token ${token}`,
//       'Accept': 'application/vnd.github.v3+json',
//       'X-GitHub-Api-Version': '2022-11-28'
//     },
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ message: "Unknown GitHub API error" }));
//     console.error(`GitHub API Error (${response.status}): ${errorData.message || response.statusText}`, errorData);
//     throw new Error(`GitHub API request failed: ${errorData.message || response.statusText}`);
//   }
//   if (response.status === 204 || response.headers.get("Content-Length") === "0") { // No Content
//     return undefined as T; // Or an appropriate empty response
//   }
//   return response.json() as Promise<T>;
// };

// const getUserProfile = (token: string): Promise<GitHubUser> => {
//   return makeGitHubRequest<GitHubUser>('/user', token);
// };

// const createRepo = (token: string, repoName: string, description: string = "My AI Generated Portfolio"): Promise<GitHubRepo> => {
//   return makeGitHubRequest<GitHubRepo>('/user/repos', token, {
//     method: 'POST',
//     body: JSON.stringify({
//       name: repoName,
//       description: description,
//       private: false, // Public repo for GitHub Pages
//       auto_init: true, // Initialize with a README to have a main branch
//     }),
//   });
// };

// // Gets content of a file or directory in a repository.
// // To check if a file exists and get its SHA (needed for updates).
// const getRepoContent = async (token: string, owner: string, repo: string, path: string, branch?: string): Promise<{ sha: string } | null> => {
//   const branchQuery = branch ? `?ref=${branch}` : '';
//   try {
//     const content = await makeGitHubRequest<{ sha: string }>(`/repos/${owner}/${repo}/contents/${path}${branchQuery}`, token);
//     return content;
//   } catch (error: any) {
//     if (error.message && error.message.includes("404") || error.message.includes("Not Found")) { // Typical error message for 404
//       return null; // File not found
//     }
//     throw error; // Re-throw other errors
//   }
// };

// const createOrUpdateFile = (
//   token: string,
//   owner: string,
//   repo: string,
//   path: string,
//   content: string, // Raw content, will be base64 encoded
//   message: string,
//   branch: string,
//   sha?: string // Required if updating an existing file
// ): Promise<any> => {
//   const base64Content = btoa(unescape(encodeURIComponent(content))); // UTF-8 safe base64 encoding
  
//   const body: { message: string; content: string; branch: string; sha?: string } = {
//     message,
//     content: base64Content,
//     branch,
//   };
//   if (sha) {
//     body.sha = sha;
//   }

//   return makeGitHubRequest(`/repos/${owner}/${repo}/contents/${path}`, token, {
//     method: 'PUT',
//     body: JSON.stringify(body),
//   });
// };

// const getBranch = async (token: string, owner: string, repo: string, branch: string): Promise<{object: {sha:string}} | null> => {
//     try {
//         return await makeGitHubRequest<{object: {sha:string}}>(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, token);
//     } catch (error: any) {
//         if (error.message && error.message.includes("404")) return null;
//         throw error;
//     }
// };

// const getDefaultBranchSha = async (token: string, owner: string, repo: string): Promise<string> => {
//     const repoData = await makeGitHubRequest<GitHubRepo & {default_branch: string}>(`/repos/${owner}/${repo}`, token);
//     const defaultBranchName = repoData.default_branch;
//     const branchData = await getBranch(token, owner, repo, defaultBranchName);
//     if (!branchData) throw new Error(`Default branch ${defaultBranchName} not found for ${owner}/${repo}`);
//     return branchData.object.sha;
// }

// const createBranch = async (token: string, owner: string, repo: string, newBranchName: string, fromSha: string): Promise<any> => {
//     return makeGitHubRequest(`/repos/${owner}/${repo}/git/refs`, token, {
//         method: 'POST',
//         body: JSON.stringify({
//             ref: `refs/heads/${newBranchName}`,
//             sha: fromSha
//         })
//     });
// }

// const enableGitHubPages = (token: string, owner: string, repo: string, branch: string = "gh-pages", path: string = "/"): Promise<any> => {
//   return makeGitHubRequest(`/repos/${owner}/${repo}/pages`, token, {
//     method: 'POST',
//     body: JSON.stringify({
//       source: {
//         branch: branch,
//         path: path, // Path within the branch, usually "/" for root.
//       },
//     }),
//   });
// };

// export const githubService = {
//   getUserProfile,
//   createRepo,
//   getRepoContent,
//   createOrUpdateFile,
//   enableGitHubPages,
//   getBranch,
//   createBranch,
//   getDefaultBranchSha,
// };



import { GitHubUser, GitHubRepo } from '../types';

const GITHUB_API_BASE_URL = 'https://api.github.com';

const makeGitHubRequest = async <T,>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${GITHUB_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown GitHub API error" }));
    console.error(`GitHub API Error (${response.status}): ${errorData.message || response.statusText}`, errorData);
    throw new Error(`GitHub API request failed: ${errorData.message || response.statusText}`);
  }
  if (response.status === 204 || response.headers.get("Content-Length") === "0") { // No Content
    return undefined as T; // Or an appropriate empty response
  }
  return response.json() as Promise<T>;
};

const getUserProfile = (token: string): Promise<GitHubUser> => {
  return makeGitHubRequest<GitHubUser>('/user', token);
};

const createRepo = (token: string, repoName: string, description: string = "My AI Generated Portfolio"): Promise<GitHubRepo> => {
  return makeGitHubRequest<GitHubRepo>('/user/repos', token, {
    method: 'POST',
    body: JSON.stringify({
      name: repoName,
      description: description,
      private: false, // Public repo for GitHub Pages
      auto_init: true, // Initialize with a README to have a main branch
    }),
  });
};

// Gets content of a file or directory in a repository.
// To check if a file exists and get its SHA (needed for updates).
const getRepoContent = async (token: string, owner: string, repo: string, path: string, branch?: string): Promise<{ sha: string } | null> => {
  const branchQuery = branch ? `?ref=${branch}` : '';
  try {
    const content = await makeGitHubRequest<{ sha: string }>(`/repos/${owner}/${repo}/contents/${path}${branchQuery}`, token);
    return content;
  } catch (error: any) {
    if (error.message && error.message.includes("404") || error.message.includes("Not Found")) { // Typical error message for 404
      return null; // File not found
    }
    throw error; // Re-throw other errors
  }
};

const createOrUpdateFile = (
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string, // Raw content, will be base64 encoded
  message: string,
  branch: string,
  sha?: string // Required if updating an existing file
): Promise<any> => {
  const base64Content = btoa(unescape(encodeURIComponent(content))); // UTF-8 safe base64 encoding
  
  const body: { message: string; content: string; branch: string; sha?: string } = {
    message,
    content: base64Content,
    branch,
  };
  if (sha) {
    body.sha = sha;
  }

  return makeGitHubRequest(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

const getBranch = async (token: string, owner: string, repo: string, branch: string): Promise<{object: {sha:string}} | null> => {
    try {
        return await makeGitHubRequest<{object: {sha:string}}>(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, token);
    } catch (error: any) {
        if (error.message && error.message.includes("404")) return null;
        throw error;
    }
};

const getDefaultBranchSha = async (token: string, owner: string, repo: string): Promise<string> => {
    const repoData = await makeGitHubRequest<GitHubRepo & {default_branch: string}>(`/repos/${owner}/${repo}`, token);
    const defaultBranchName = repoData.default_branch;
    const branchData = await getBranch(token, owner, repo, defaultBranchName);
    if (!branchData) throw new Error(`Default branch ${defaultBranchName} not found for ${owner}/${repo}`);
    return branchData.object.sha;
}

const createBranch = async (token: string, owner: string, repo: string, newBranchName: string, fromSha: string): Promise<any> => {
    return makeGitHubRequest(`/repos/${owner}/${repo}/git/refs`, token, {
        method: 'POST',
        body: JSON.stringify({
            ref: `refs/heads/${newBranchName}`,
            sha: fromSha
        })
    });
}

const enableGitHubPages = (token: string, owner: string, repo: string, branch: string = "gh-pages", path: string = "/"): Promise<any> => {
  return makeGitHubRequest(`/repos/${owner}/${repo}/pages`, token, {
    method: 'POST',
    body: JSON.stringify({
      source: {
        branch: branch,
        path: path, // Path within the branch, usually "/" for root.
      },
    }),
  });
};

export const githubService = {
  getUserProfile,
  createRepo,
  getRepoContent,
  createOrUpdateFile,
  enableGitHubPages,
  getBranch,
  createBranch,
  getDefaultBranchSha,
};
