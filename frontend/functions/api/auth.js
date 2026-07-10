export async function onRequest(context) {
  const { password } = await context.request.json();
  const correctPassword = context.env.ADMIN_PASSWORD;

  if (!correctPassword) {
    return Response.json({ error: 'ADMIN_PASSWORD not configured' }, { status: 500 });
  }

  if (password === correctPassword) {
    return Response.json({ success: true }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  return Response.json({ success: false, error: 'Invalid password' }, { status: 401 });
}
