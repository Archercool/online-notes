const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function githubHeaders(env) {
  return {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Online-Notes-App',
  };
}

function decodeContent(encoded) {
  return decodeURIComponent(escape(atob(encoded)));
}

function encodeContent(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

async function handleListFiles(env) {
  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/`,
    { headers: githubHeaders(env) }
  );

  if (!res.ok) {
    return json({ error: 'Failed to fetch files', status: res.status }, res.status);
  }

  const files = await res.json();
  const markdownFiles = Array.isArray(files)
    ? files
        .filter((f) => f.name.endsWith('.md') && f.type === 'file')
        .map((f) => ({ name: f.name, path: f.path, sha: f.sha, size: f.size }))
    : [];

  return json(markdownFiles);
}

async function handleGetFile(url, env) {
  const path = url.searchParams.get('path');
  if (!path) return json({ error: 'path is required' }, 400);

  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
    { headers: githubHeaders(env) }
  );

  if (res.status === 404) {
    return json({ error: 'File not found' }, 404);
  }

  if (!res.ok) {
    return json({ error: 'Failed to fetch file' }, res.status);
  }

  const data = await res.json();
  const content = decodeContent(data.content);

  return json({ content, sha: data.sha, name: data.name, path: data.path });
}

async function handleSaveFile(request, env) {
  const { path, content, sha, message } = await request.json();
  if (!path || content === undefined) {
    return json({ error: 'path and content are required' }, 400);
  }

  const commitMessage = message || `Update ${path}`;
  const body = {
    message: commitMessage,
    content: encodeContent(content),
  };

  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: githubHeaders(env),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return json({ error: err.message || 'Failed to save' }, res.status);
  }

  const data = await res.json();
  return json({ success: true, sha: data.content?.sha, path: data.content?.path });
}

async function handleCreateFile(request, env) {
  const { path, content, message } = await request.json();
  if (!path || content === undefined) {
    return json({ error: 'path and content are required' }, 400);
  }

  const commitMessage = message || `Create ${path}`;
  const body = {
    message: commitMessage,
    content: encodeContent(content),
  };

  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: githubHeaders(env),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return json({ error: err.message || 'Failed to create' }, res.status);
  }

  const data = await res.json();
  return json({ success: true, sha: data.content?.sha, path: data.content?.path });
}

async function handleDeleteFile(request, env) {
  const { path, sha, message } = await request.json();
  if (!path || !sha) {
    return json({ error: 'path and sha are required' }, 400);
  }

  const commitMessage = message || `Delete ${path}`;

  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: 'DELETE',
      headers: githubHeaders(env),
      body: JSON.stringify({ message: commitMessage, sha }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return json({ error: err.message || 'Failed to delete' }, res.status);
  }

  return json({ success: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      switch (url.pathname) {
        case '/api/files':
          return await handleListFiles(env);

        case '/api/file':
          return await handleGetFile(url, env);

        case '/api/save':
          return await handleSaveFile(request, env);

        case '/api/create':
          return await handleCreateFile(request, env);

        case '/api/delete':
          return await handleDeleteFile(request, env);

        default:
          return json({ error: 'Not Found' }, 404);
      }
    } catch (err) {
      return json({ error: err.message || 'Internal Error' }, 500);
    }
  },
};
