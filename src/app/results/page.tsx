import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResultsContent } from "./ResultsContent";
import { SkeletonCard } from "@/components/ui/Skeleton";

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawZip = Array.isArray(params.zip) ? params.zip[0] : (params.zip ?? "");
  const zip = rawZip.replace(/\D/g, "").slice(0, 5);

  if (zip.length !== 5) {
    return (
      <main className="flex-1 px-4 py-12 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-foreground">
            Invalid zip code
          </h1>
          <p className="mt-2 text-muted">
            Please enter a valid 5-digit US zip code.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 mt-4 text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        New search
      </Link>

      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsContent zip={zip} />
      </Suspense>

      {/* Bottom navigation */}
      <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-4 text-sm">
        <Link
          href={`/feed/${zip}`}
          className="text-primary hover:underline font-medium"
        >
          Community Feed
        </Link>
        <Link
          href={`/report?zip=${zip}`}
          className="text-primary hover:underline font-medium"
        >
          Report an Issue
        </Link>
      </div>
    </main>
  );
}
