const GITHUB_REPO = 'Archercool/online-notes';

function githubHeaders(token) {
  return {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Online-Notes-App',
  };
}

function encodeContent(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (context.request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const token = context.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
  }

  const { path, content, message } = await context.request.json();
  if (!path || content === undefined) {
    return Response.json({ error: 'path and content are required' }, { status: 400 });
  }

  const commitMessage = message || `Create ${path}`;
  const body = {
    message: commitMessage,
    content: encodeContent(content),
  };

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: githubHeaders(token),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return Response.json({ error: err.message || 'Failed to create' }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(
    { success: true, sha: data.content?.sha, path: data.content?.path },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  );
}
