import { Suspense } from "react";
import { DetailView } from "@/components/Views";

export default function GamePage({ params }: PageProps<"/activities/[group]/[game]">) {
  return (
    <Suspense fallback={<p className="py-24 text-center">Loading…</p>}>
      {params.then(({ group, game }) => <DetailView type="activity" groupId={group} slug={game} />)}
    </Suspense>
  );
}
