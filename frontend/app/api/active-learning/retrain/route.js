export async function POST(req) {
    try {
        const body = await req.json()

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/active/retrain`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        const data = await res.json()
        return Response.json(data, { status: res.status })

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 })
    }
}
