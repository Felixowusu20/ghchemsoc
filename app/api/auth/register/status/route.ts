import { NextResponse } from "next/server";
import { getAdminRegistrationStatus } from "@/lib/admin-registration";
import { prisma } from "@/lib/prisma";

/** Public — tells the register page which fields to show (no secrets exposed). */
export async function GET() {
  const count = await prisma.adminUser.count();
  return NextResponse.json(getAdminRegistrationStatus(count));
}
