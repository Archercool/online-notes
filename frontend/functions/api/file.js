const GITHUB_REPO = 'Archercool/online-notes';

function githubHeaders(token) {
  return {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Online-Notes-App',
  };
}

function decodeContent(encoded) {
  return decodeURIComponent(escape(atob(encoded)));
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const token = context.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
  }

  const url = new URL(context.request.url);
  const path = url.searchParams.get('path');
  if (!path) {
    return Response.json({ error: 'path is required' }, { status: 400 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    { headers: githubHeaders(token) }
  );

  if (res.status === 404) {
    return Response.json({ error: 'File not found' }, { status: 404 });
  }

  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch file' }, { status: res.status });
  }

  const data = await res.json();
  const content = decodeContent(data.content);

  return Response.json(
    { content, sha: data.sha, name: data.name, path: data.path },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  );
}
