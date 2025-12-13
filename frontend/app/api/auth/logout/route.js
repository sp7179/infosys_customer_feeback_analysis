import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (err) {
    return NextResponse.json({ message: "Error during logout" }, { status: 500 });
  }
}
