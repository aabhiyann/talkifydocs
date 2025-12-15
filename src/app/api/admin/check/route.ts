import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      isAdmin: user?.tier === "ADMIN",
    });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}

