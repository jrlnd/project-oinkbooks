import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Currently Down for Maintenance
        </h1>
        <p className="text-lg text-white/80 sm:text-2xl">
          Try Again Later or Visit My Portfolio
        </p>
        <Link
          className="rounded-xl bg-white/10 px-6 py-3 text-lg font-semibold text-white hover:bg-white/20"
          href="https://jrlnd.dev/"
        >
          Visit My Portfolio →
        </Link>
      </div>
    </main>
  );
}
