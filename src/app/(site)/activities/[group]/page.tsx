import { Suspense } from "react";
import { GroupView } from "@/components/Views";

export default function GroupPage({ params }: PageProps<"/activities/[group]">) {
  return (
    <Suspense fallback={<p className="py-24 text-center">Loading…</p>}>
      {params.then(({ group }) => <GroupView groupId={group} />)}
    </Suspense>
  );
}
