export async function GET(req, { params }) {
    const { jobid } = params

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/feedback/active/status/${jobid}`
        )

        const data = await res.json()
        return Response.json(data, { status: res.status })

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 })
    }
}
