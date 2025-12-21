import { createServerClient } from "@/trpc/server";
import { HighlightCard } from "@/components/highlights/HighlightCard";
import { HighlightsSearch } from "@/components/highlights/HighlightsSearch";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bookmark } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Highlights | TalkifyDocs",
  description: "Saved Q&A pairs from your document conversations",
};

export default async function HighlightsPage() {
  const serverClient = await createServerClient();
  const highlights = await serverClient.getHighlights({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-display-lg mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text font-bold text-transparent">
            Saved Highlights
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300">
            Important Q&A pairs you&apos;ve saved from your document conversations
          </p>
        </div>

        {highlights.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No highlights saved yet"
            description="Save important Q&A pairs from your chats to reference later. Click the 'Save' button on any AI response in your conversations."
          />
        ) : (
          <HighlightsSearch highlights={highlights as any} />
        )}
      </div>
    </div>
  );
}
