import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-center">
      <Image
        src="/aven-logo.jpeg"
        alt="S.S.D.N AvenPro Universal Sports & Talent Federation logo"
        width={420}
        height={420}
        className="h-auto w-full max-w-[420px]"
        preload
      />
      <h1 className="text-3xl font-bold text-green-800">
        Aven<span className="text-red-600">Pro</span>
      </h1>
      <p className="text-lg text-zinc-700">
        Universal Sports &amp; Talent Federation (USTF)
      </p>
      <p className="font-semibold text-green-800">
        One Platform <span className="text-red-600">Unlimited Talent</span>
      </p>
    </main>
  );
}
