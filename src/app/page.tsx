import { createRoomAction, joinRoomAction } from "@/app/actions";
import { RELATIONSHIP_OPTIONS, SAMPLE_TOPICS } from "@/lib/questions";
import { hasSupabaseEnv } from "@/lib/supabase/admin";

const FEATURES = [
  "Create a room and share a short code",
  "Play with friends, couples, families, or mixed groups",
  "Mix self-answers with predictions about each other",
  "See pairwise bond percentages and group sync at the end",
];

export default function Home() {
  const ready = hasSupabaseEnv();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(247,148,29,0.24),_transparent_30%),linear-gradient(180deg,_#fff7ed_0%,_#fffbeb_45%,_#ffffff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="grid gap-6 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_rgba(148,63,0,0.12)] backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">
              Relationship Bond Game
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                See how well people really know each other.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Host a private room, answer rotating personal questions, predict
                each other, and reveal a bond percentage for every pair in the
                group.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-amber-100 bg-white/90 p-4 text-sm font-medium text-slate-700"
                >
                  {feature}
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                Sample categories
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {SAMPLE_TOPICS.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {!ready ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
                Add your Supabase keys to <code>.env.local</code> before
                creating rooms. The UI is ready, but room creation needs the
                database connection.
              </div>
            ) : null}

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-950">
                  Create a room
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Best for the host. Start the room and share the code.
                </p>
              </div>

              <form action={createRoomAction} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Your name
                  </span>
                  <input
                    name="playerName"
                    required
                    placeholder="User1"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-amber-400 focus:bg-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Relationship type
                  </span>
                  <select
                    name="relationshipType"
                    required
                    defaultValue="friends"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-amber-400 focus:bg-white"
                  >
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Group size
                  </span>
                  <select
                    name="maxPlayers"
                    defaultValue="2"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-amber-400 focus:bg-white"
                  >
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4 people</option>
                    <option value="5">5 people</option>
                    <option value="6">6 people</option>
                    <option value="8">8 people</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="h-12 w-full rounded-2xl bg-slate-950 font-semibold text-white transition hover:bg-slate-800"
                >
                  Create room
                </button>
              </form>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-950">
                  Join a room
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Use the host&apos;s room code from another browser or device.
                </p>
              </div>

              <form action={joinRoomAction} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Your name
                  </span>
                  <input
                    name="playerName"
                    required
                    placeholder="User2"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-amber-400 focus:bg-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Room code
                  </span>
                  <input
                    name="roomCode"
                    required
                    placeholder="ABCD12"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 uppercase outline-none transition focus:border-amber-400 focus:bg-white"
                  />
                </label>

                <button
                  type="submit"
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white font-semibold text-slate-950 transition hover:border-slate-950 hover:bg-slate-50"
                >
                  Join room
                </button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
