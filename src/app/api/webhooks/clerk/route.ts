import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.warn(
    "[Clerk Webhook] CLERK_WEBHOOK_SECRET is not set. Webhook verification will fail."
  );
}

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error: Missing Svix headers", { status: 400 });
  }

  if (!WEBHOOK_SECRET) {
    return new NextResponse("Error: Missing CLERK_WEBHOOK_SECRET", {
      status: 500,
    });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying Clerk webhook:", err);
    return new NextResponse("Error: Invalid signature", { status: 400 });
  }

  const eventType = evt.type;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, image_url, first_name, last_name } = evt.data;

      const primaryEmail = email_addresses?.[0]?.email_address ?? "";
      const fullName =
        [first_name, last_name].filter((part) => !!part).join(" ") || null;

      await db.user.upsert({
        where: { clerkId: id },
        create: {
          clerkId: id,
          email: primaryEmail,
          name: fullName,
          imageUrl: image_url ?? null,
        },
        update: {
          email: primaryEmail,
          name: fullName,
          imageUrl: image_url ?? null,
        },
      });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      // Cascade deletes are handled by Prisma relations
      await db.user.deleteMany({
        where: { clerkId: id },
      });
    }
  } catch (error) {
    console.error("Error handling Clerk webhook event:", error);
    return new NextResponse("Error: Webhook handler failure", {
      status: 500,
    });
  }

  return NextResponse.json({ received: true });
}


