export async function GET() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/feedback/active/prediction_history`
        )

        const data = await res.json()
        return Response.json(data, { status: res.status })

    } catch (err) {
        return Response.json(
            { error: err.message },
            { status: 500 }
        )
    }
}
