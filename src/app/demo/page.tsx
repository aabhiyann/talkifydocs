import { DEMO_DOCUMENTS } from "@/lib/demo";
import { DocumentGrid } from "@/components/dashboard/DocumentGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Demo - TalkifyDocs",
  description: "Try TalkifyDocs with example documents",
};

// Adapt demo documents to the FileSummary shape expected by DocumentGrid
const demoFiles = DEMO_DOCUMENTS.map((doc) => ({
  id: doc.id,
  name: doc.name,
  createdAt: new Date().toISOString(),
  uploadStatus: "SUCCESS" as const,
  thumbnailUrl: doc.thumbnailUrl,
  pageCount: doc.pageCount,
  summary: doc.summary,
  entities: null,
  _count: { messages: 0 },
}));

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
            Try TalkifyDocs
          </h1>
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            Explore our example documents and experience AI-powered document chat without creating
            an account. Sign up anytime to use your own PDFs.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="px-8">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-semibold">Example Documents</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Click any document to open it in demo chat mode.
          </p>
        </div>

        <DocumentGrid
          files={demoFiles as any}
          viewMode="grid"
          onDelete={() => {}}
          onRetry={undefined}
          isDemo={true}
        />
      </div>
    </div>
  );
}
