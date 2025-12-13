export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Profile from "@/lib/models/Profile";

export async function POST(req, { params }) {
  try {
    const { userid } = await params;
    if (!userid) return NextResponse.json({ message: "userid required" }, { status: 400 });

    const form = await req.formData();
    const file = form.get("file");
    if (!file) return NextResponse.json({ message: "file is required" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const mime = file.type || "image/png";
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${mime};base64,${base64}`;

    await connectDB();
    const profile = await Profile.findOneAndUpdate(
      { userid },
      { photo: dataUrl, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Photo uploaded", photo: profile.photo }, { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
