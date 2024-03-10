"use client";

import Button from "@/components/cards/Button";
import { useSend } from "@/components/session/ClientSession";
import { useState } from "react";

export default function CreateRoomClient() {
  const [roomName, setRoomName] = useState("");

  const postMessage = useSend();

  const createRoom = async () => {
    const result = await postMessage("/room/create", {
      roomName: roomName,
    });
    if (result) {
      window.open("/room/" + result.roomID, "_self");
    }
    console.log(result);
  };

  return (
    <>
      <div className="gigabold text-3xl text-zinc-200">Create room</div>
      <div className=" bg-zinc-800 w-5/6 rounded-xl">
        <input
          type="text"
          name="username"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className=" rounded-xl font-bold text-center outline-none text-xl text-zinc-200 p-[0.625rem] w-full bg-zinc-800 autofill:!bg-zinc-700"
        />
      </div>

      <Button
        id="create"
        className="w-5/6 items-center border-zinc-900 flex justify-center gigabold text-2xl text-zinc-900 bg-zinc-200 rounded-xl p-2 cursor-pointer hover:scale-105 transition-all"
        onClick={createRoom}
      >
        Create
      </Button>
    </>
  );
}
