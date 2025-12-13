export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/get_model`)
    const data = await res.json()
    return Response.json(data, { status: 200 })
  } catch (err) {
    console.error("Backend not reachable:", err)
    return Response.json({ message: "Backend not connected" }, { status: 500 })
  }
}
