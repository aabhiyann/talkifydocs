"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Server Action to prepare an upload.
 *
 * Right now this primarily ensures the user is authenticated and has a User
 * record. You can extend this to enforce per-plan upload limits (e.g. number
 * of files, total storage, etc.) or to generate signed upload URLs for other
 * storage providers such as Vercel Blob.
 */
export async function prepareUpload() {
  const user = await requireUser();

  // Example: ensure the user record exists and return basic plan info
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      tier: true,
    },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  return {
    userId: dbUser.id,
    email: dbUser.email,
    tier: dbUser.tier,
  };
}


