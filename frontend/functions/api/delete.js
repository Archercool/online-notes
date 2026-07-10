const GITHUB_REPO = 'Archercool/online-notes';

function githubHeaders(token) {
  return {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Online-Notes-App',
  };
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

  const { path, sha, message } = await context.request.json();
  if (!path || !sha) {
    return Response.json({ error: 'path and sha are required' }, { status: 400 });
  }

  const commitMessage = message || `Delete ${path}`;

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'DELETE',
      headers: githubHeaders(token),
      body: JSON.stringify({ message: commitMessage, sha }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return Response.json({ error: err.message || 'Failed to delete' }, { status: res.status });
  }

  return Response.json(
    { success: true },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  );
}
