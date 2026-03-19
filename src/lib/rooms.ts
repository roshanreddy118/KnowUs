import {
  countLocalPlayers,
  createLocalRoom,
  findLocalRoomByCode,
  getLocalAnswers,
  getLocalPlayers,
  joinLocalRoom,
  startLocalGame,
  submitLocalAnswer,
  updateLocalRoomProgress,
} from "@/lib/dev-store";
import {
  getQuestionsForRelationship,
  getRandomQuestionSet,
  getRelationshipLabel,
} from "@/lib/questions";
import {
  getSupabaseAdminClient,
  hasSupabaseEnv,
} from "@/lib/supabase/admin";

type CreateRoomInput = {
  hostName: string;
  relationshipType: string;
  maxPlayers: number;
};

type JoinRoomInput = {
  playerName: string;
  roomCode: string;
};

type SubmitAnswerInput = {
  roomCode: string;
  playerName: string;
  answer: string;
};

type PlayerRow = {
  id: string;
  room_id?: string;
  name: string;
  created_at: string;
};

type RoomRow = {
  id: string;
  code: string;
  relationship_type: string;
  host_name: string;
  max_players: number;
  status: string;
  current_question_index: number;
  selected_questions: string[] | null;
  recent_questions?: string[] | null;
  created_at: string;
};

type AnswerRow = {
  id: string;
  room_id: string;
  question_index: number;
  player_name: string;
  answer: string;
  created_at: string;
};

export type RoomDetails = RoomRow & {
  players: PlayerRow[];
  answers: AnswerRow[];
  relationship_type_label: string;
  current_question: string | null;
  answer_count_for_current_question: number;
  bond_percentage: number | null;
  bond_label: string | null;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "for",
  "he",
  "her",
  "his",
  "i",
  "is",
  "it",
  "my",
  "of",
  "or",
  "she",
  "the",
  "their",
  "them",
  "they",
  "this",
  "to",
  "we",
  "you",
]);

const TOKEN_ALIASES: Record<string, string> = {
  chillin: "chill",
  chilling: "chill",
  chillout: "chill",
  genuinity: "genuine",
  genuinty: "genuine",
  genuineity: "genuine",
  honestly: "honest",
  honesty: "honest",
};

function generateRoomCode(length = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

function shouldUseLocalMode() {
  return process.env.BOND_LOCAL_MODE === "true" || !hasSupabaseEnv();
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeToken(token: string) {
  const cleaned = token.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!cleaned || STOP_WORDS.has(cleaned)) {
    return "";
  }

  const alias = TOKEN_ALIASES[cleaned] ?? cleaned;

  if (alias.endsWith("ing") && alias.length > 5) {
    return alias.slice(0, -3);
  }

  if (alias.endsWith("ed") && alias.length > 4) {
    return alias.slice(0, -2);
  }

  if (alias.endsWith("s") && alias.length > 4) {
    return alias.slice(0, -1);
  }

  return alias;
}

function getNormalizedTokens(value: string) {
  return value
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean);
}

function levenshteinDistance(first: string, second: string) {
  const matrix = Array.from({ length: first.length + 1 }, () =>
    Array(second.length + 1).fill(0),
  );

  for (let row = 0; row <= first.length; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column <= second.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= first.length; row += 1) {
    for (let column = 1; column <= second.length; column += 1) {
      const cost = first[row - 1] === second[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[first.length][second.length];
}

function stringSimilarity(first: string, second: string) {
  if (!first && !second) {
    return 1;
  }

  if (!first || !second) {
    return 0;
  }

  const maxLength = Math.max(first.length, second.length);
  if (maxLength === 0) {
    return 1;
  }

  return 1 - levenshteinDistance(first, second) / maxLength;
}

export function getAnswerSimilarity(firstAnswer: string, secondAnswer: string) {
  const normalizedFirst = normalizeAnswer(firstAnswer);
  const normalizedSecond = normalizeAnswer(secondAnswer);

  if (normalizedFirst === normalizedSecond) {
    return 100;
  }

  const firstTokens = getNormalizedTokens(normalizedFirst);
  const secondTokens = getNormalizedTokens(normalizedSecond);

  const normalizedTokenFirst = firstTokens.join(" ");
  const normalizedTokenSecond = secondTokens.join(" ");

  if (normalizedTokenFirst && normalizedTokenFirst === normalizedTokenSecond) {
    return 100;
  }

  const phraseScore = Math.max(
    stringSimilarity(normalizedFirst, normalizedSecond),
    stringSimilarity(normalizedTokenFirst, normalizedTokenSecond),
  );

  let tokenScore = 0;

  if (firstTokens.length > 0 && secondTokens.length > 0) {
    const firstToSecond =
      firstTokens.reduce((sum, token) => {
        const best = secondTokens.reduce(
          (currentBest, candidate) =>
            Math.max(currentBest, stringSimilarity(token, candidate)),
          0,
        );

        return sum + best;
      }, 0) / firstTokens.length;

    const secondToFirst =
      secondTokens.reduce((sum, token) => {
        const best = firstTokens.reduce(
          (currentBest, candidate) =>
            Math.max(currentBest, stringSimilarity(token, candidate)),
          0,
        );

        return sum + best;
      }, 0) / secondTokens.length;

    tokenScore = (firstToSecond + secondToFirst) / 2;
  }

  const containsScore =
    normalizedTokenFirst &&
    normalizedTokenSecond &&
    (normalizedTokenFirst.includes(normalizedTokenSecond) ||
      normalizedTokenSecond.includes(normalizedTokenFirst))
      ? 0.92
      : 0;

  return Math.round(Math.max(phraseScore, tokenScore, containsScore) * 100);
}

function calculateBondPercentage(
  players: PlayerRow[],
  answers: AnswerRow[],
  questionCount: number,
) {
  if (players.length < 2 || questionCount === 0) {
    return 0;
  }

  let totalChecks = 0;
  let similarityTotal = 0;

  for (let questionIndex = 0; questionIndex < questionCount; questionIndex += 1) {
    const questionAnswers = players
      .map((player) =>
        answers.find(
          (answer) =>
            answer.question_index === questionIndex &&
            answer.player_name.toLowerCase() === player.name.toLowerCase(),
        ),
      )
      .filter(Boolean) as AnswerRow[];

    for (let first = 0; first < questionAnswers.length; first += 1) {
      for (let second = first + 1; second < questionAnswers.length; second += 1) {
        totalChecks += 1;
        similarityTotal += getAnswerSimilarity(
          questionAnswers[first].answer,
          questionAnswers[second].answer,
        );
      }
    }
  }

  if (!totalChecks) {
    return 0;
  }

  return Math.round(similarityTotal / totalChecks);
}

function getBondLabel(score: number) {
  if (score >= 90) return "Soul Sync";
  if (score >= 75) return "Bestie Energy";
  if (score >= 60) return "Strong Bond";
  if (score >= 40) return "Casual Sync";
  return "Getting To Know Each Other";
}

async function findRoomByCode(code: string) {
  if (shouldUseLocalMode()) {
    return findLocalRoomByCode(code);
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .maybeSingle<RoomRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createRoom({
  hostName,
  relationshipType,
  maxPlayers,
}: CreateRoomInput) {
  let code = generateRoomCode();
  let existing = await findRoomByCode(code);

  while (existing) {
    code = generateRoomCode();
    existing = await findRoomByCode(code);
  }

  if (shouldUseLocalMode()) {
    return createLocalRoom({
      code,
      relationshipType,
      hostName,
      maxPlayers,
    });
  }

  const supabase = getSupabaseAdminClient();
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      code,
      relationship_type: relationshipType,
      host_name: hostName,
      max_players: maxPlayers,
      status: "lobby",
      current_question_index: 0,
      selected_questions: [],
    })
    .select("*")
    .single<RoomRow>();

  if (roomError) {
    throw new Error(roomError.message);
  }

  const { error: playerError } = await supabase.from("players").insert({
    room_id: room.id,
    name: hostName,
  });

  if (playerError) {
    throw new Error(playerError.message);
  }

  return room;
}

export async function joinRoomByCode({ playerName, roomCode }: JoinRoomInput) {
  const room = await findRoomByCode(roomCode);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (shouldUseLocalMode()) {
    const count = await countLocalPlayers(room.id);

    if (count >= room.max_players) {
      throw new Error("This room is already full.");
    }

    await joinLocalRoom({
      roomId: room.id,
      playerName,
    });

    return room;
  }

  const supabase = getSupabaseAdminClient();
  const { count, error: countError } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room.id);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) >= room.max_players) {
    throw new Error("This room is already full.");
  }

  const { data: existingPlayer, error: existingPlayerError } = await supabase
    .from("players")
    .select("id")
    .eq("room_id", room.id)
    .ilike("name", playerName)
    .maybeSingle();

  if (existingPlayerError) {
    throw new Error(existingPlayerError.message);
  }

  if (!existingPlayer) {
    const { error: insertError } = await supabase.from("players").insert({
      room_id: room.id,
      name: playerName,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return room;
}

export async function getRoomDetails(code: string): Promise<RoomDetails | null> {
  const room = await findRoomByCode(code.toUpperCase());

  if (!room) {
    return null;
  }

  if (shouldUseLocalMode()) {
    const players = await getLocalPlayers(room.id);
    const answers = await getLocalAnswers(room.id);
    const questionCount = room.selected_questions?.length ?? 0;
    const bondPercentage =
      room.status === "completed"
        ? calculateBondPercentage(players, answers, questionCount)
        : null;

    return {
      ...room,
      selected_questions: room.selected_questions ?? [],
      players,
      answers,
      relationship_type_label: getRelationshipLabel(room.relationship_type),
      current_question:
        room.selected_questions?.[room.current_question_index] ?? null,
      answer_count_for_current_question: answers.filter(
        (answer) => answer.question_index === room.current_question_index,
      ).length,
      bond_percentage: bondPercentage,
      bond_label: bondPercentage === null ? null : getBondLabel(bondPercentage),
    };
  }

  const supabase = getSupabaseAdminClient();
  const [{ data: players, error: playersError }, { data: answers, error: answersError }] =
    await Promise.all([
      supabase
        .from("players")
        .select("id, room_id, name, created_at")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("answers")
        .select("id, room_id, question_index, player_name, answer, created_at")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true }),
    ]);

  if (playersError) {
    throw new Error(playersError.message);
  }

  if (answersError) {
    throw new Error(answersError.message);
  }

  const playerRows = (players ?? []) as PlayerRow[];
  const answerRows = (answers ?? []) as AnswerRow[];
  const questionCount = room.selected_questions?.length ?? 0;
  const bondPercentage =
    room.status === "completed"
      ? calculateBondPercentage(playerRows, answerRows, questionCount)
      : null;

  return {
    ...room,
    selected_questions: room.selected_questions ?? [],
    players: playerRows,
    answers: answerRows,
    relationship_type_label: getRelationshipLabel(room.relationship_type),
    current_question:
      room.selected_questions?.[room.current_question_index] ?? null,
    answer_count_for_current_question: answerRows.filter(
      (answer) => answer.question_index === room.current_question_index,
    ).length,
    bond_percentage: bondPercentage,
    bond_label: bondPercentage === null ? null : getBondLabel(bondPercentage),
  };
}

export async function startGame(roomCode: string) {
  const room = await findRoomByCode(roomCode.toUpperCase());

  if (!room) {
    throw new Error("Room not found.");
  }

  const selectedQuestions = getRandomQuestionSet(room.relationship_type, 5);

  if (shouldUseLocalMode()) {
    return startLocalGame({
      roomId: room.id,
      selectedQuestions,
    });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("rooms")
    .update({
      status: "active",
      current_question_index: 0,
      selected_questions: selectedQuestions,
    })
    .eq("id", room.id);

  if (error) {
    throw new Error(error.message);
  }

  return room;
}

export async function playAgain(roomCode: string) {
  const room = await findRoomByCode(roomCode.toUpperCase());

  if (!room) {
    throw new Error("Room not found.");
  }

  const previousQuestions = room.selected_questions ?? [];
  const selectedQuestions = getRandomQuestionSet(
    room.relationship_type,
    5,
    previousQuestions,
  );

  if (shouldUseLocalMode()) {
    return startLocalGame({
      roomId: room.id,
      selectedQuestions,
      isReplay: true,
    });
  }

  const supabase = getSupabaseAdminClient();
  const { error: deleteAnswersError } = await supabase
    .from("answers")
    .delete()
    .eq("room_id", room.id);

  if (deleteAnswersError) {
    throw new Error(deleteAnswersError.message);
  }

  const { error } = await supabase
    .from("rooms")
    .update({
      status: "active",
      current_question_index: 0,
      recent_questions: previousQuestions,
      selected_questions: selectedQuestions,
    })
    .eq("id", room.id);

  if (error) {
    throw new Error(error.message);
  }

  return room;
}

export async function submitAnswer({
  roomCode,
  playerName,
  answer,
}: SubmitAnswerInput) {
  const room = await findRoomByCode(roomCode.toUpperCase());

  if (!room) {
    throw new Error("Room not found.");
  }

  const cleanedAnswer = answer.trim();

  if (!cleanedAnswer) {
    throw new Error("Please enter an answer before submitting.");
  }

  if (shouldUseLocalMode()) {
    await submitLocalAnswer({
      roomId: room.id,
      questionIndex: room.current_question_index,
      playerName,
      answer: cleanedAnswer,
    });

    const [players, answers] = await Promise.all([
      getLocalPlayers(room.id),
      getLocalAnswers(room.id),
    ]);

    const currentAnswerCount = answers.filter(
      (item) => item.question_index === room.current_question_index,
    ).length;

    if (currentAnswerCount >= players.length) {
      const nextIndex = room.current_question_index + 1;
      const totalQuestions = room.selected_questions?.length ?? 0;

      await updateLocalRoomProgress({
        roomId: room.id,
        currentQuestionIndex:
          nextIndex < totalQuestions ? nextIndex : room.current_question_index,
        status: nextIndex >= totalQuestions ? "completed" : "active",
      });
    }

    return;
  }

  const supabase = getSupabaseAdminClient();
  const { data: existingAnswer, error: existingError } = await supabase
    .from("answers")
    .select("id")
    .eq("room_id", room.id)
    .eq("question_index", room.current_question_index)
    .ilike("player_name", playerName)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingAnswer) {
    const { error } = await supabase
      .from("answers")
      .update({ answer: cleanedAnswer })
      .eq("id", existingAnswer.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("answers").insert({
      room_id: room.id,
      question_index: room.current_question_index,
      player_name: playerName,
      answer: cleanedAnswer,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  const [{ count: playerCount, error: playerCountError }, { count: answerCount, error: answerCountError }] =
    await Promise.all([
      supabase
        .from("players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id),
      supabase
        .from("answers")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id)
        .eq("question_index", room.current_question_index),
    ]);

  if (playerCountError) {
    throw new Error(playerCountError.message);
  }

  if (answerCountError) {
    throw new Error(answerCountError.message);
  }

  if ((answerCount ?? 0) >= (playerCount ?? 0)) {
    const nextIndex = room.current_question_index + 1;
    const totalQuestions = room.selected_questions?.length ?? 0;
    const { error } = await supabase
      .from("rooms")
      .update({
        current_question_index:
          nextIndex < totalQuestions ? nextIndex : room.current_question_index,
        status: nextIndex >= totalQuestions ? "completed" : "active",
      })
      .eq("id", room.id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export function hasPlayerAnsweredCurrentQuestion(
  room: RoomDetails | null,
  playerName: string,
) {
  if (!room) {
    return false;
  }

  return room.answers.some(
    (answer) =>
      answer.question_index === room.current_question_index &&
      answer.player_name.toLowerCase() === playerName.toLowerCase(),
  );
}

export function getFinalAnswerGrid(room: RoomDetails) {
  return (room.selected_questions ?? []).map((question, index) => ({
    question,
    answers: room.players.map((player) => ({
      playerName: player.name,
      answer:
        room.answers.find(
          (item) =>
            item.question_index === index &&
            item.player_name.toLowerCase() === player.name.toLowerCase(),
        )?.answer ?? "No answer",
    })),
    similarity:
      room.players.length === 2
        ? getAnswerSimilarity(
            room.answers.find(
              (item) =>
                item.question_index === index &&
                item.player_name.toLowerCase() ===
                  room.players[0].name.toLowerCase(),
            )?.answer ?? "",
            room.answers.find(
              (item) =>
                item.question_index === index &&
                item.player_name.toLowerCase() ===
                  room.players[1].name.toLowerCase(),
            )?.answer ?? "",
          )
        : null,
  }));
}

export function getQuestionProgressLabel(room: RoomDetails) {
  const totalQuestions = room.selected_questions?.length ?? 0;

  if (!totalQuestions) {
    return "0 / 0";
  }

  return `${Math.min(room.current_question_index + 1, totalQuestions)} / ${totalQuestions}`;
}

export function getQuestionPreview(relationshipType: string) {
  return getQuestionsForRelationship(relationshipType).slice(0, 3);
}
