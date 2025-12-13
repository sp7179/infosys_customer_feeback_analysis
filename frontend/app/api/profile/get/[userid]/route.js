import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Profile from "@/lib/models/Profile";

export async function GET(req, { params }) {
  try {
    const { userid } = await params;
    if (!userid) return NextResponse.json({ message: "userid required" }, { status: 400 });
    await connectDB();
    const profile = await Profile.findOne({ userid }).lean();
    if (!profile) return NextResponse.json({ profile: null }, { status: 200 });
    return NextResponse.json({ profile }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
