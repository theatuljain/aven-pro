import { Suspense } from "react";
import { RegisterView } from "@/components/register/RegisterView";

export default function RegisterPage({ params }: PageProps<"/register/[slug]">) {
  return (
    <Suspense fallback={<p className="py-24 text-center">Loading…</p>}>
      {params.then(({ slug }) => <RegisterView key={slug} slug={slug} />)}
    </Suspense>
  );
}
