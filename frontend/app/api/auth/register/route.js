import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Profile from "@/lib/models/Profile";

function validatePassword(password) {
  if (!password) return { ok: false, msg: "Password required" };
  const lengthOk = password.length >= 8;
  const upperOk = /[A-Z]/.test(password);
  const lowerOk = /[a-z]/.test(password);
  const numberOk = /[0-9]/.test(password);
  const specialOk = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!lengthOk) return { ok: false, msg: "atleast 8 characters" };
  if (!(upperOk && lowerOk && numberOk)) return { ok: false, msg: "contain characters and the numbers , upper case also" };
  if (!specialOk) return { ok: false, msg: "atleast a special character" };
  return { ok: true };
}

export async function POST(req) {
  try {
    const { name, userid, password } = await req.json();
    if (!name || !userid || !password) {
      return NextResponse.json({ message: "name, userid and password are required" }, { status: 400 });
    }

    const passValidation = validatePassword(password);
    if (!passValidation.ok) {
      return NextResponse.json({ message: passValidation.msg }, { status: 400 });
    }

    await connectDB();

    // userid uniqueness
    const existing = await User.findOne({ userid });
    if (existing) {
      return NextResponse.json({ message: "userid already taken" }, { status: 409 });
    }

    // password uniqueness: compare plaintext against existing hashed passwords
    

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, userid, password: hashedPassword });
    await newUser.save();

    // create empty profile record linked by userid
    const newProfile = new Profile({ userid, fullName: name});
    await newProfile.save();

    return NextResponse.json({ message: "User registered successfully", userId: newUser._id }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
