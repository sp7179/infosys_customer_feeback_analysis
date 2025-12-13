import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"

function validatePassword(p) {
  return p.length >= 8 &&
    /[A-Z]/.test(p) &&
    /[a-z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(p)
}

export async function POST(req) {
  try {
    const { userid, currentPassword, newPassword } = await req.json()
    if (!userid || !currentPassword || !newPassword)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 })

    await connectDB()
    const user = await User.findOne({ userid })
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 })

    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return NextResponse.json({ message: "Current password incorrect" }, { status: 401 })

    if (!validatePassword(newPassword))
      return NextResponse.json({ message: "New password invalid format" }, { status: 400 })

    // unique password check
    

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    return NextResponse.json({ message: "Password changed successfully" }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 })
  }
}
