import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userid = searchParams.get("userid")?.trim();
    if (!userid) return NextResponse.json({ exists: false }, { status: 400 });

    await connectDB();
    const exists = !!(await User.findOne({ userid }));
    return NextResponse.json({ exists });
  } catch (err) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
