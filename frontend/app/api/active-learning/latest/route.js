export async function GET() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/feedback/active/metrics_latest`
        )

        const data = await res.json()
        return Response.json(data, { status: res.status })

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 })
    }
}
