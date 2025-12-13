export async function POST(request) {
  try {
    const { model } = await request.json()

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/set_model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model }),
    })

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch (err) {
    console.error("Backend not reachable:", err)
    return Response.json({ message: "Backend not connected" }, { status: 500 })
  }
}
