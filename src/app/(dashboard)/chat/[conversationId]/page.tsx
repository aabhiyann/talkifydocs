import ConversationChatShell from "@/components/chat/ConversationChatShell";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    conversationId: string;
  };
}

const ChatPage = async ({ params }: PageProps) => {
  const user = await requireUser();

  const conversation = await db.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      conversationFiles: {
        include: {
          file: true,
        },
      },
    },
  });

  if (!conversation || conversation.userId !== user.id) {
    notFound();
  }

  const conversationFiles = conversation.conversationFiles;

  if (conversationFiles.length === 0) {
    notFound();
  }

  // Get all user files for the file selector (excluding already added ones)
  const currentFileIds = new Set(conversationFiles.map((cf) => cf.fileId));
  const availableFiles = await db.file.findMany({
    where: {
      userId: user.id,
      uploadStatus: "SUCCESS",
      id: {
        notIn: Array.from(currentFileIds),
      },
    },
    take: 20, // Limit to avoid huge lists
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">
      <ConversationChatShell
        conversationId={params.conversationId}
        files={conversationFiles}
        availableFiles={availableFiles}
      />
    </div>
  );
};

export default ChatPage;


