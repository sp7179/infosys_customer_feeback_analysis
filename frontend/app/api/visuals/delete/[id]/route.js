import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/visuals/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete visual" }, { status: 500 });
  }
}
