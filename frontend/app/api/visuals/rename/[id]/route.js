import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id } = params;
  const { name } = await request.json();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/visuals/${id}/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to rename visual" }, { status: 500 });
  }
}
