import Link from "next/link";
import { notFound } from "next/navigation";

import {
  playAgainAction,
  startGameAction,
  submitAnswerAction,
} from "@/app/actions";
import { CopyRoomCodeButton } from "@/app/room/[code]/copy-room-code-button";
import { RoomLiveUpdater } from "@/app/room/[code]/room-live-updater";
import {
  getFinalAnswerGrid,
  getQuestionPreview,
  getQuestionProgressLabel,
  getRoomDetails,
  hasPlayerAnsweredCurrentQuestion,
} from "@/lib/rooms";

type RoomPageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ player?: string }>;
};

export default async function RoomPage({
  params,
  searchParams,
}: RoomPageProps) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  const room = await getRoomDetails(code);

  if (!room) {
    notFound();
  }

  const player = query.player ?? "Guest";
  const questions = getQuestionPreview(room.relationship_type);
  const canStart = room.status === "lobby" && room.players.length >= 2;
  const answeredCurrent = hasPlayerAnsweredCurrentQuestion(room, player);
  const finalGrid = room.status === "completed" ? getFinalAnswerGrid(room) : [];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <RoomLiveUpdater />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
              Room {room.code}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              {room.relationship_type_label}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              You joined as <span className="font-semibold text-white">{player}</span>.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-slate-300">
            <span>Host: {room.host_name}</span>
            <span>
              Players: {room.players.length} / {room.max_players}
            </span>
            <span>Status: {room.status}</span>
          </div>
        </div>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
              Share this room code
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-2xl font-black tracking-[0.3em] text-white">
                {room.code}
              </span>
              <CopyRoomCodeButton code={room.code} />
            </div>
          </div>
          <p className="max-w-lg text-sm leading-7 text-slate-200">
            Send this code to the other players so they can join from the home
            page.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Room members</h2>
              </div>
              <Link
                href="/"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Home
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {room.players.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{participant.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Player {index + 1}
                    </p>
                  </div>
                  {participant.name === room.host_name ? (
                    <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">
                      Host
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            {canStart ? (
              <form action={startGameAction} className="mt-6">
                <input type="hidden" name="roomCode" value={room.code} />
                <input type="hidden" name="playerName" value={player} />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-200"
                >
                  Start game
                </button>
              </form>
            ) : null}
          </div>

          <div className="grid gap-6">
            {room.status === "lobby" ? (
              <section className="rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-br from-amber-300/15 via-orange-300/10 to-rose-300/10 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-200">
                  Round preview
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  Questions rotate each time you play
                </h2>
                <div className="mt-5 grid gap-3">
                  {questions.map((question, index) => (
                    <div
                      key={question}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                        Question {index + 1}
                      </p>
                      <p className="mt-2 text-base text-slate-100">{question}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {room.status === "active" ? (
              <section className="rounded-[1.75rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-300/15 via-cyan-300/10 to-sky-300/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">
                      Live question
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Question {getQuestionProgressLabel(room)}
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-100">
                    {room.answer_count_for_current_question} of {room.players.length} answered
                  </span>
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-lg leading-8 text-slate-100">
                    {room.current_question}
                  </p>
                </div>

                {answeredCurrent ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                    Your answer is submitted. This room will update automatically when the other person answers.
                  </div>
                ) : (
                  <form action={submitAnswerAction} className="mt-5 space-y-4">
                    <input type="hidden" name="roomCode" value={room.code} />
                    <input type="hidden" name="playerName" value={player} />
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-200">
                        Your private answer
                      </span>
                      <textarea
                        name="answer"
                        required
                        rows={4}
                        placeholder="Type what feels true for you..."
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-100"
                    >
                      Submit answer
                    </button>
                  </form>
                )}
              </section>
            ) : null}

            {room.status === "completed" ? (
              <section className="rounded-[1.75rem] border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-300/15 via-rose-300/10 to-amber-300/10 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-200">
                  Final result
                </p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-5xl font-black text-white">
                      {room.bond_percentage}%
                    </h2>
                    <p className="mt-2 text-lg text-slate-100">{room.bond_label}</p>
                  </div>
                  <p className="max-w-md text-sm leading-7 text-slate-200">
                    This MVP score compares how often both people gave the same answer across five rounds. Next we can make it richer with prediction rounds and weighted categories.
                  </p>
                </div>

                <form action={playAgainAction} className="mt-6">
                  <input type="hidden" name="roomCode" value={room.code} />
                  <input type="hidden" name="playerName" value={player} />
                  <button
                    type="submit"
                    className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-fuchsia-100"
                  >
                    Play again
                  </button>
                </form>

                <div className="mt-6 grid gap-4">
                  {finalGrid.map((item, index) => (
                    <div
                      key={item.question}
                      className="rounded-3xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                          Question {index + 1}
                        </p>
                        {typeof item.similarity === "number" ? (
                          <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold text-fuchsia-100">
                            Match {item.similarity}%
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-base text-white">{item.question}</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {item.answers.map((answer) => (
                          <div
                            key={`${item.question}-${answer.playerName}`}
                            className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                          >
                            <p className="text-sm font-semibold text-amber-200">
                              {answer.playerName}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-200">
                              {answer.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-bold">How the score will work</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-amber-200">
                    Similarity
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    The first playable version checks how often both people gave matching answers.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-amber-200">
                    Private answers
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Each browser submits separately, then the room advances once everyone has answered.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-amber-200">
                    Next version
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Prediction rounds will make the bond score smarter for friends, couples, and families.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
