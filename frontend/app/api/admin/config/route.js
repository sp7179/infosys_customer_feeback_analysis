export async function GET(req) {
  const token = req.headers.get("authorization") || `Bearer ${req.cookies.get("admin_token")?.value || ""}`;
  const res = await fetch(`${process.env.ADMIN_API}/config`, {
    headers: { "Authorization": token || "" }
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function POST(req) {
  const token = req.headers.get("authorization") || `Bearer ${req.cookies.get("admin_token")?.value || ""}`;

  const body = await req.json();
  const res = await fetch(`${process.env.ADMIN_API}/config`, {
    method: "POST",
    headers: { "Content-Type":"application/json", "Authorization": token||"" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function PUT(req) {
  const token = req.headers.get("authorization");
  const { item_id } = Object.fromEntries(await req.json()) || {};
  const body = await req.json();
  const res = await fetch(`${process.env.ADMIN_API}/config/${item_id}`, {
    method: "PUT",
    headers: { "Content-Type":"application/json", "Authorization": token||"" },
    body: JSON.stringify(body)
  });
  return new Response(await res.text(), { status: res.status });
}

export async function DELETE(req) {
  const token = req.headers.get("authorization");
  const url = new URL(req.url);
  const key = url.searchParams.get("key"); // frontend will call ?key=...
  const res = await fetch(`${process.env.ADMIN_API}/config/${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: { "Authorization": token||"" }
  });
  return new Response(await res.text(), { status: res.status });
}
