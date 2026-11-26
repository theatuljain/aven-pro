import { Suspense } from "react";
import { DetailView } from "@/components/Views";

export default function TalentDetailPage({ params }: PageProps<"/talent/[slug]">) {
  return (
    <Suspense fallback={<p className="py-24 text-center">Loading…</p>}>
      {params.then(({ slug }) => <DetailView type="talent" slug={slug} />)}
    </Suspense>
  );
}
