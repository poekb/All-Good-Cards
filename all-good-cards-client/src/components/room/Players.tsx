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
import React from "react";
export default function Players({
  params,
}: {
  params: {
    roomID: string;
    players: {
      ownerID: string;
      playerList: Player[];
    };
  };
}) {
  const addListener = useSocketEvent();

  var defList: Player[] = [];
  var defOwner = "";

  if (typeof params.players.playerList !== "undefined") {
    defList = params.players.playerList;
    defOwner = params.players.ownerID;
  }
  defList.sort((a, b) => b.score - a.score);

  const [owner, setOwner] = useState(defOwner);
  const [playerList, setPlayerList] = useState(defList);
  useEffect(() => {
    addListener("player", (body) => {
      const list = body.playerList;
      list.sort((a: Player, b: Player) => b.score - a.score);
      setOwner(body.ownerID);
      setPlayerList(body.playerList);
    });
  });

  return (
    <div
      className={
        "flex flex-row flex-wrap gap-2 p-3 w-full justify-center items-center text-zinc-900"
      }
    >
      {playerList.map((player, index) => {
        return (
          <div
            key={index}
            className={
              "p-2 transition-all font-bold flex flex-row items-center rounded-md gap-1 " +
              (player.ready
                ? "bg-zinc-200 text-zinc-900"
                : "bg-zinc-900 text-zinc-200")
            }
          >
            {owner === player.id ? (
              <svg
                viewBox="-4 0 32 32"
                className={
                  "w-6  " + (player.ready ? "fill-zinc-900" : "fill-zinc-200")
                }
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <title>crown</title>{" "}
                  <path d="M12 10.938c-1.375 0-2.5-1.125-2.5-2.5 0-1.406 1.125-2.5 2.5-2.5s2.5 1.094 2.5 2.5c0 1.375-1.125 2.5-2.5 2.5zM2.031 9.906c1.094 0 1.969 0.906 1.969 2 0 1.125-0.875 2-1.969 2-1.125 0-2.031-0.875-2.031-2 0-1.094 0.906-2 2.031-2zM22.031 9.906c1.094 0 1.969 0.906 1.969 2 0 1.125-0.875 2-1.969 2-1.125 0-2.031-0.875-2.031-2 0-1.094 0.906-2 2.031-2zM4.219 23.719l-1.656-9.063c0.5-0.094 0.969-0.375 1.344-0.688 1.031 0.938 2.344 1.844 3.594 1.844 1.5 0 2.719-2.313 3.563-4.25 0.281 0.094 0.625 0.188 0.938 0.188s0.656-0.094 0.938-0.188c0.844 1.938 2.063 4.25 3.563 4.25 1.25 0 2.563-0.906 3.594-1.844 0.375 0.313 0.844 0.594 1.344 0.688l-1.656 9.063h-15.563zM3.875 24.5h16.25v1.531h-16.25v-1.531z"></path>{" "}
                </g>
              </svg>
            ) : (
              <></>
            )}
            {player.name}
            <div
              className={
                "w-6 h-6 rounded-full font-bold flex items-center justify-center ml-1 " +
                (player.ready
                  ? "bg-zinc-800 text-zinc-200"
                  : "bg-zinc-200 text-zinc-900")
              }
            >
              {player.score}
            </div>
          </div>
        );
      })}
    </div>
  );
}
