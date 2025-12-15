import { getHighlights } from "@/actions/highlights";
import { HighlightCard } from "@/components/highlights/HighlightCard";
import { HighlightsSearch } from "@/components/highlights/HighlightsSearch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Highlights | TalkifyDocs",
  description: "Saved Q&A pairs from your document conversations",
};

export default async function HighlightsPage() {
  const highlights = await getHighlights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-display-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            Saved Highlights
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300">
            Important Q&A pairs you&apos;ve saved from your document conversations
          </p>
        </div>

        {highlights.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
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
            <h3 className="text-heading-lg font-semibold text-foreground mb-2">
              No highlights saved yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
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

