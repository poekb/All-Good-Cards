"use client";

interface Player {
  id: string;
  ready: boolean;
  score: number;
  name: string;
}

import { useEffect, useState } from "react";
import { useSend, useSocketEvent } from "../session/ClientSession";
import { motion } from "framer-motion";
import Button, { UseClearLoading } from "../cards/Button";
export default function WinnerScreen({ roomData }: { roomData: any }) {
  var defList: Player[] = [];

  const send = useSend();
  const clearLoading = UseClearLoading();

  const endGame = async () => {
    await send("/room/end", { roomID: roomData.roomID });
    clearLoading();
  };

  if (typeof roomData.players.playerList !== "undefined") {
    defList = roomData.players.playerList;
  }
  defList.sort((a, b) => b.score - a.score);
  return (
    <>
      <div
        className={
          "flex flex-row flex-wrap gap-2 p-3 w-full justify-center items-center text-zinc-200 grow font-bold text-4xl"
        }
      >
        The Winner Is{" "}
        <span className="text-5xl gigabold">{defList[0].name}</span>!
      </div>
      {roomData.isOwner && (
        <Button
          id="continue"
          onClick={endGame}
          className="p-3 h-fit w-fit text-2xl flex justify-center items-center bg-zinc-300 text-center rounded-xl gigabold hover:scale-105 cursor-pointer transition-all select-none"
        >
          Continue
        </Button>
      )}
    </>
  );
}
