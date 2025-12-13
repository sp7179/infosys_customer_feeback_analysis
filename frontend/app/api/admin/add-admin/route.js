export async function POST(req) {
    const token = req.headers.get("authorization") || `Bearer ${req.cookies.get("admin_token")?.value || ""}`;
    const body = await req.json();

    const res = await fetch(`${process.env.ADMIN_API}/admins`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        },
        body: JSON.stringify(body),
    });

    return new Response(await res.text(), { status: res.status });
}
