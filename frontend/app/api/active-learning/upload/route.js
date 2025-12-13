export async function POST(req) {
    try {
        const form = await req.formData()

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/active/upload`, {
            method: "POST",
            body: form
        })

        const data = await res.json()
        return Response.json(data, { status: res.status })

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 })
    }
}
