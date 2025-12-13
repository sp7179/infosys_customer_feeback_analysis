export async function GET(req) {
  const token = req.headers.get("authorization") || `Bearer ${req.cookies.get("admin_token")?.value || ""}`;

  const url = new URL(req.url);
  const q = url.searchParams.toString();
  const res = await fetch(`${process.env.ADMIN_API}/users${q?`?${q}`:""}`, {
    headers: { "Authorization": token||"" }
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function DELETE(req) {
  const token = req.headers.get("authorization");
  const { id } = await req.json();
  const res = await fetch(`${process.env.ADMIN_API}/users/${id}`, {
    method: "DELETE",
    headers: { "Authorization": token||"" }
  });
  return new Response(await res.text(), { status: res.status });
}
