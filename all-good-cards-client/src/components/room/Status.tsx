"use client";

import Packs from "@/components/room/Packs";
import Players from "@/components/room/Players";
import { Session } from "@/components/session/Session";
import postServerRequest from "@/services/http/serverRequestService";
import redirectFromStatus from "@/services/room/redirectStatus";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocketEvent } from "../session/ClientSession";
import StartButton from "./StartButton";
import WhiteCards from "./WhiteCardChooser";
import BlackCardChooser from "./BlackCardChooser";
import Judging from "./Judging";
import React from "react";
import WinnerScreen from "./WinnerScreen";

enum Status {
  options,
  waiting,
  blackPicker,
  judge,
  player,
  spectator,
  ended,
}

export default function RoomStatus({
  defRoomData,
}: Readonly<{
  defRoomData: any;
}>) {
  const [roomData, setRoomData] = useState(defRoomData);

  const addListener = useSocketEvent();

  useEffect(() => {
    addListener("statusChange", (body) => {
      setRoomData(body);
    });
  });

  return (
    <React.Fragment key={JSON.stringify(roomData)}>
      {roomData.status === Status.waiting ? (
        <div className="w-full h-full flex items-center justify-center text-center mt-10 text-zinc-200 font-bold text-2xl mb-10">
          Waiting for owner to start the round...
        </div>
      ) : (
        ""
      )}
      {roomData.status === Status.options ? (
        <>
          <Packs
            params={{
              roomID: roomData.roomID,
            }}
            defpacks={roomData.packs}
          ></Packs>
          <StartButton roomID={roomData.roomID}></StartButton>
        </>
      ) : (
        ""
      )}
      {roomData.status === Status.player ? (
        <>
          <WhiteCards roomData={roomData}></WhiteCards>
        </>
      ) : (
        ""
      )}
      {roomData.status === Status.blackPicker ? (
        <>
          <BlackCardChooser roomData={roomData}></BlackCardChooser>
        </>
      ) : (
        ""
      )}
      {roomData.status === Status.judge ? (
        <Judging roomData={roomData}></Judging>
      ) : (
        ""
      )}
      {roomData.status === Status.ended ? (
        <WinnerScreen roomData={roomData}></WinnerScreen>
      ) : (
        ""
      )}
    </React.Fragment>
  );
}
