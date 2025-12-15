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

  const files = conversation.conversationFiles.map((cf) => cf.file);

  if (files.length === 0) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">
      <ConversationChatShell files={files} />
    </div>
  );
};

export default ChatPage;


