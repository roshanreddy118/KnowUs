"use server";

import { redirect } from "next/navigation";

import {
  createRoom,
  joinRoomByCode,
  playAgain,
  startGame,
  submitAnswer,
} from "@/lib/rooms";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createRoomAction(formData: FormData) {
  const playerName = getString(formData, "playerName");
  const relationshipType = getString(formData, "relationshipType");
  const maxPlayers = Number(getString(formData, "maxPlayers") || "2");

  if (!playerName || !relationshipType) {
    throw new Error("Please enter your name and pick a relationship type.");
  }

  const room = await createRoom({
    hostName: playerName,
    relationshipType,
    maxPlayers,
  });

  redirect(`/room/${room.code}?player=${encodeURIComponent(playerName)}`);
}

export async function joinRoomAction(formData: FormData) {
  const playerName = getString(formData, "playerName");
  const roomCode = getString(formData, "roomCode").toUpperCase();

  if (!playerName || !roomCode) {
    throw new Error("Please enter your name and room code.");
  }

  const room = await joinRoomByCode({
    playerName,
    roomCode,
  });

  redirect(`/room/${room.code}?player=${encodeURIComponent(playerName)}`);
}

export async function startGameAction(formData: FormData) {
  const roomCode = getString(formData, "roomCode").toUpperCase();
  const playerName = getString(formData, "playerName");

  if (!roomCode || !playerName) {
    throw new Error("Missing room information.");
  }

  await startGame(roomCode);
  redirect(`/room/${roomCode}?player=${encodeURIComponent(playerName)}`);
}

export async function submitAnswerAction(formData: FormData) {
  const roomCode = getString(formData, "roomCode").toUpperCase();
  const playerName = getString(formData, "playerName");
  const answer = getString(formData, "answer");

  if (!roomCode || !playerName) {
    throw new Error("Missing room information.");
  }

  await submitAnswer({
    roomCode,
    playerName,
    answer,
  });

  redirect(`/room/${roomCode}?player=${encodeURIComponent(playerName)}`);
}

export async function playAgainAction(formData: FormData) {
  const roomCode = getString(formData, "roomCode").toUpperCase();
  const playerName = getString(formData, "playerName");

  if (!roomCode || !playerName) {
    throw new Error("Missing room information.");
  }

  await playAgain(roomCode);
  redirect(`/room/${roomCode}?player=${encodeURIComponent(playerName)}`);
}
