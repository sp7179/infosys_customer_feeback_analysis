export async function PUT(req) {
  const token = req.headers.get("authorization") || `Bearer ${req.cookies.get("admin_token")?.value || ""}`;

  const body = await req.json();
  const res = await fetch(`${process.env.ADMIN_API}/admins/change-password`, {
    method: "PUT",
    headers: { "Content-Type":"application/json", "Authorization": token||"" },
    body: JSON.stringify(body)
  });
  return new Response(await res.text(), { status: res.status });
}


export async function GET(req) {
  const token = req.headers.get("authorization") || `Bearer ${req.cookies.get("admin_token")?.value || ""}`;

  const res = await fetch(`${process.env.ADMIN_API}/admins/change-password`, {
    headers: { Authorization: token }
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}
