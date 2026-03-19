import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "bonded-local-store.json");

type LocalRoom = {
  id: string;
  code: string;
  relationship_type: string;
  host_name: string;
  max_players: number;
  status: string;
  current_question_index: number;
  selected_questions: string[];
  recent_questions: string[];
  created_at: string;
};

type LocalPlayer = {
  id: string;
  room_id: string;
  name: string;
  created_at: string;
};

type LocalAnswer = {
  id: string;
  room_id: string;
  question_index: number;
  player_name: string;
  answer: string;
  created_at: string;
};

type LocalStore = {
  rooms: LocalRoom[];
  players: LocalPlayer[];
  answers: LocalAnswer[];
};

const emptyStore: LocalStore = {
  rooms: [],
  players: [],
  answers: [],
};

async function ensureStoreFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(emptyStore, null, 2), "utf8");
  }
}

async function readStore() {
  await ensureStoreFile();
  const contents = await readFile(dataFile, "utf8");
  const parsed = JSON.parse(contents) as Partial<LocalStore>;

  return {
    rooms: parsed.rooms ?? [],
    players: parsed.players ?? [],
    answers: parsed.answers ?? [],
  };
}

async function writeStore(store: LocalStore) {
  await ensureStoreFile();
  await writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

function randomId() {
  return crypto.randomUUID();
}

export async function findLocalRoomByCode(code: string) {
  const store = await readStore();
  return store.rooms.find((room) => room.code === code) ?? null;
}

export async function createLocalRoom(input: {
  code: string;
  relationshipType: string;
  hostName: string;
  maxPlayers: number;
}) {
  const store = await readStore();
  const room = {
    id: randomId(),
    code: input.code,
    relationship_type: input.relationshipType,
    host_name: input.hostName,
    max_players: input.maxPlayers,
    status: "lobby",
    current_question_index: 0,
    selected_questions: [],
    recent_questions: [],
    created_at: new Date().toISOString(),
  };

  const player = {
    id: randomId(),
    room_id: room.id,
    name: input.hostName,
    created_at: new Date().toISOString(),
  };

  store.rooms.push(room);
  store.players.push(player);
  await writeStore(store);

  return room;
}

export async function joinLocalRoom(input: {
  roomId: string;
  playerName: string;
}) {
  const store = await readStore();
  const existingPlayer = store.players.find(
    (player) =>
      player.room_id === input.roomId &&
      player.name.toLowerCase() === input.playerName.toLowerCase(),
  );

  if (!existingPlayer) {
    store.players.push({
      id: randomId(),
      room_id: input.roomId,
      name: input.playerName,
      created_at: new Date().toISOString(),
    });
    await writeStore(store);
  }
}

export async function countLocalPlayers(roomId: string) {
  const store = await readStore();
  return store.players.filter((player) => player.room_id === roomId).length;
}

export async function getLocalPlayers(roomId: string) {
  const store = await readStore();
  return store.players
    .filter((player) => player.room_id === roomId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function startLocalGame(input: {
  roomId: string;
  selectedQuestions: string[];
  isReplay?: boolean;
}) {
  const store = await readStore();
  const room = store.rooms.find((item) => item.id === input.roomId);

  if (!room) {
    throw new Error("Room not found.");
  }

  room.status = "active";
  room.current_question_index = 0;
  room.recent_questions = input.isReplay ? room.selected_questions : [];
  room.selected_questions = input.selectedQuestions;
  if (input.isReplay) {
    store.answers = store.answers.filter((answer) => answer.room_id !== room.id);
  }
  await writeStore(store);

  return room;
}

export async function submitLocalAnswer(input: {
  roomId: string;
  questionIndex: number;
  playerName: string;
  answer: string;
}) {
  const store = await readStore();
  const existingAnswer = store.answers.find(
    (item) =>
      item.room_id === input.roomId &&
      item.question_index === input.questionIndex &&
      item.player_name.toLowerCase() === input.playerName.toLowerCase(),
  );

  if (existingAnswer) {
    existingAnswer.answer = input.answer;
  } else {
    store.answers.push({
      id: randomId(),
      room_id: input.roomId,
      question_index: input.questionIndex,
      player_name: input.playerName,
      answer: input.answer,
      created_at: new Date().toISOString(),
    });
  }

  await writeStore(store);
}

export async function getLocalAnswers(roomId: string) {
  const store = await readStore();
  return store.answers
    .filter((answer) => answer.room_id === roomId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function updateLocalRoomProgress(input: {
  roomId: string;
  currentQuestionIndex?: number;
  status?: string;
}) {
  const store = await readStore();
  const room = store.rooms.find((item) => item.id === input.roomId);

  if (!room) {
    throw new Error("Room not found.");
  }

  if (typeof input.currentQuestionIndex === "number") {
    room.current_question_index = input.currentQuestionIndex;
  }

  if (input.status) {
    room.status = input.status;
  }

  await writeStore(store);
  return room;
}
