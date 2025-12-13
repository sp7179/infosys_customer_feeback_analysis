import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/feedback/visuals`);
    const visuals = response.data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return NextResponse.json({ visuals });
  } catch (error) {
    console.error("Error fetching visuals:", error);
    return NextResponse.json({ visuals: [], error: "Failed to fetch visuals" }, { status: 500 });
  }
}
