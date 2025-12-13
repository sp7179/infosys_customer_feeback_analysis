export async function GET(req) {
  const token = `Bearer ${req.cookies.get("admin_token")?.value || ""}`;


  const res = await fetch(`${process.env.ADMIN_API}/datasets`, {
    headers: { "Authorization": token||"" }
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}
