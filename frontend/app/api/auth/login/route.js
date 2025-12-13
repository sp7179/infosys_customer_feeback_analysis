import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    const { userid, password } = await req.json();
    if (!userid || !password) {
      return NextResponse.json({ message: "userid and password required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ userid });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign({ userId: user._id, userid: user.userid }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      message: "Login successful",
      token,
      userId: user._id,
      userid: user.userid,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
