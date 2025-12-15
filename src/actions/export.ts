"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function exportChatAsMarkdown(conversationId: string) {
  const user = await requireUser();

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      conversationFiles: {
        include: {
          file: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation || conversation.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  const fileNames = conversation.conversationFiles
    .map((cf) => cf.file.name)
    .join(", ");

  const markdown = `# Chat Export - ${conversation.title}

**Exported:** ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}  
**Documents:** ${fileNames}  
**Total Messages:** ${conversation.messages.length}

---

${conversation.messages
  .map((msg) => {
    const role = msg.isUserMessage ? "👤 You" : "🤖 Assistant";
    const timestamp = format(new Date(msg.createdAt), "h:mm a");
    const citations = Array.isArray(msg.citations)
      ? msg.citations
      : msg.citations
      ? [msg.citations]
      : [];

    let citationText = "";
    if (citations.length > 0) {
      const citationList = citations
        .map((c: any) => {
          const page = c.pageNumber ?? c.page ?? (typeof c.pageIndex === "number" ? c.pageIndex + 1 : undefined);
          const filename = c.filename || c.fileName || c.title || "Document";
          return page ? `${filename} (p.${page})` : filename;
        })
        .join(", ");
      citationText = `\n\n**Sources:** ${citationList}`;
    }

    return `### ${role}
*${timestamp}*

${msg.text}${citationText}`;
  })
  .join("\n\n---\n\n")}

---

*Exported from TalkifyDocs - AI-powered document conversations*
`;

  return markdown;
}

export async function createShareableLink(conversationId: string) {
  const user = await requireUser();

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  // Generate a unique share token
  const shareToken = randomUUID();

  await db.conversation.update({
    where: { id: conversationId },
    data: { shareToken, isPublic: true },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const shareUrl = `${baseUrl}/share/${shareToken}`;
  revalidatePath(`/chat/${conversationId}`);
  return shareUrl;
}

export async function revokeShareableLink(conversationId: string) {
  const user = await requireUser();

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  await db.conversation.update({
    where: { id: conversationId },
    data: { shareToken: null, isPublic: false },
  });

  revalidatePath(`/chat/${conversationId}`);
  return { success: true };
}

export async function getShareableLink(conversationId: string) {
  const user = await requireUser();

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  if (!conversation.shareToken || !conversation.isPublic) {
    return null;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  return `${baseUrl}/share/${conversation.shareToken}`;
}

