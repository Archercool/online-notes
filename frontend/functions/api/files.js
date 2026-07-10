const GITHUB_REPO = 'Archercool/online-notes';

function githubHeaders(token) {
  return {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Online-Notes-App',
  };
}

export async function onRequest(context) {
  const token = context.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/`,
    { headers: githubHeaders(token) }
  );

  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch files' }, { status: res.status });
  }

  const files = await res.json();
  const markdownFiles = Array.isArray(files)
    ? files
        .filter((f) => f.name.endsWith('.md') && f.type === 'file')
        .map((f) => ({ name: f.name, path: f.path, sha: f.sha, size: f.size }))
    : [];

  return Response.json(markdownFiles, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
