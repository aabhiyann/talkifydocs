import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Metadata, Viewport } from "next";
import { ResizableChatLayout } from "@/components/dashboard/ResizableChatLayout";

interface PageProps {
  params: {
    fileid: string;
  };
}

export const metadata: Metadata = {
  title: "Document Viewer | TalkifyDocs",
  description: "View and chat with your PDF documents using AI-powered insights.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10b981",
};

const Page = async ({ params }: PageProps) => {
  // retrieve file id
  const { fileid } = await params;

  const user = await requireUser();

  //make db call
  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id,
    },
  });

  if (!file) notFound();

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <ResizableChatLayout fileUrl={file.url} fileId={file.id} />
    </div>
  );
};

export default Page;
