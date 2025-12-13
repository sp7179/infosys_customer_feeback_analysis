import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/visuals/${id}`);
    const visual = await res.json();
    return NextResponse.json(visual);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch visual" }, { status: 500 });
  }
}
