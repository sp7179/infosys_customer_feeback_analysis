import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Profile from "@/lib/models/Profile";

export async function PUT(req, { params }) {
  try {
    const { userid } = await params;
    if (!userid) return NextResponse.json({ message: "userid required" }, { status: 400 });
    const updates = await req.json(); // expects JSON with fields
    await connectDB();

    const profile = await Profile.findOneAndUpdate(
      { userid },
      { ...updates, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Profile updated", profile }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
