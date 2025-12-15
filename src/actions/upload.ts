"use server";

import { put } from "@vercel/blob";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { processPDF } from "@/lib/upload/process-pdf";

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.literal("application/pdf"),
  size: z.number().max(200 * 1024 * 1024), // 200MB max (applies to Pro/Admin)
});

/**
 * Prepare an upload by ensuring the user exists and returning basic info.
 */
export async function prepareUpload() {
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({
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

/**
 * Server Action for uploading a PDF to Vercel Blob and creating a File record.
 * This follows the spec: validates file, uploads to Blob, writes to Prisma,
 * and triggers async processing.
 */
export async function uploadPDF(formData: FormData) {
  const user = await requireUser();

  // Extract and validate the file
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file provided");
  }

  uploadSchema.parse({
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  // Enforce tier-based size limits (Free: 50MB, Pro/Admin: 200MB)
  const isProOrAdmin = user.tier === "PRO" || user.tier === "ADMIN";
  const freeMaxBytes = 50 * 1024 * 1024;

  if (!isProOrAdmin && file.size > freeMaxBytes) {
    throw new Error(
      "Free plan supports files up to 50MB. Upgrade to Pro for larger uploads."
    );
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });

  // Create database record with PENDING status
  const created = await prisma.file.create({
    data: {
      name: file.name,
      key: blob.pathname ?? blob.url,
      url: blob.url,
      size: BigInt(file.size),
      uploadStatus: "PENDING",
      userId: user.id,
    },
  });

  // Trigger processing (await so errors bubble up; can be made fire-and-forget)
  await processPDF(created.id);

  return {
    fileId: created.id,
    url: created.url,
  };
}


