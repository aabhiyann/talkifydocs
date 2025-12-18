import { createServerClient } from "@/trpc/server";
import { HighlightCard } from "@/components/highlights/HighlightCard";
import { HighlightsSearch } from "@/components/highlights/HighlightsSearch";
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
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h3 className="text-heading-lg mb-2 font-semibold text-foreground">
              No highlights saved yet
            </h3>
            <p className="mx-auto mb-4 max-w-md text-gray-600 dark:text-gray-400">
              Save important Q&A pairs from your chats to reference later
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click the &quot;Save&quot; button on any AI response in your conversations
            </p>
          </div>
        ) : (
          <HighlightsSearch highlights={highlights} />
        )}
      </div>
    </div>
  );
}
