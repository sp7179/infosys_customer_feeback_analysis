export async function GET(req) {
  const token = req.headers.get("authorization") || `Bearer ${req.cookies.get("admin_token")?.value || ""}`;

  const res = await fetch(`${process.env.ADMIN_API}/models/growth`, { headers: { Authorization: token||"" }});
  if (!res.ok) return new Response(JSON.stringify({ history: [] }), { status: res.status });
  const data = await res.json();

  return new Response(JSON.stringify(data), { status: res.status });
}
