import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
          Room not found
        </p>
        <h1 className="mt-3 text-3xl font-black">That code is not active.</h1>
        <p className="mt-3 text-slate-300">
          Head back, create a new room, or double-check the code from the host.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-100"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
