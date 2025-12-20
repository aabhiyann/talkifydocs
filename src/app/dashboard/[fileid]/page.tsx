import { ChatWrapper } from "@/components/chat/ChatWrapper";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Metadata, Viewport } from "next";
import AsyncPdfRenderer from "@/components/AsyncPdfRenderer";

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
  const { fileid } = params;

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
    <div className="flex h-[calc(100vh-3.5rem)] flex-1 flex-col justify-between">
      <div className="max-w-8xl mx-auto w-full grow lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <AsyncPdfRenderer url={file.url} />
          </div>
        </div>

        {/* Right side */}
        <div className="flex-[0.75] shrink-0 border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper fileId={file.id} />
        </div>
      </div>
    </div>
  );
};

export default Page;
