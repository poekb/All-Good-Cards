import { useEffect, useState } from "react";
import { useSend, useSocketEvent } from "../session/ClientSession";
import Button, { UseClearLoading } from "../cards/Button";
import { createContext } from "vm";
var owner = "";

export default function StartButton({ roomID }: { roomID: string }) {
  const sendMessage = useSend();

  const clearLoading = UseClearLoading();

  const StartGame = async () => {
    const result = await sendMessage("/room/start", {
      roomID: roomID,
    });
    clearLoading();
  };

  return (
    <div className="w-full flex items-center justify-center gap-2">
      <Button
        onClick={StartGame}
        className="w-fit m-6 items-center flex justify-center font-bold text-2xl text-zinc-900 bg-zinc-200 p-3 transition-all border-zinc-900"
        id="start-button"
      >
        Start game
      </Button>
    </div>
  );
}
