"use client";

import { useEffect, useState } from "react";
import { useSend, useSocketEvent } from "../session/ClientSession";
import Button, { UseRemoveLoading } from "../cards/Button";
var owner = "";
export default function Packs({
  params,
  defpacks: defPacks,
}: {
  params: {
    roomID: string;
  };
  defpacks: { packID: string; name: string }[];
}) {
  const sendMessage = useSend();

  const [packCode, setPackCode] = useState("");

  const [packs, setPacks] = useState(defPacks);

  const removeLoading = UseRemoveLoading();

  const addPack = async () => {
    const result = await sendMessage("/room/addpack", {
      roomID: params.roomID,
      packCode: packCode,
    });
    removeLoading("add-pack");
    setPacks(result.packs);
    setPackCode("");
  };

  const deletePack = async (packID: string) => {
    const result = await sendMessage("/room/deletepack", {
      roomID: params.roomID,
      packID: packID,
    });
    removeLoading(packID);

    setPacks(result.packs);
  };

  return (
    <div className="w-full flex items-center justify-center gap-2">
      <div className="min-w-40 bg-zinc-900 p-3 flex flex-col gap-3 rounded-2xl">
        {packs.map((pack) => {
          return (
            <div
              key={pack.packID}
              className="h-5rem flex justify-between gap-3"
            >
              <div className="bg-zinc-800 text-zinc-200 gigabold p-2 text-center flex-grow rounded-xl max-w-72 overflow-ellipsis overflow-hidden text-nowrap">
                {pack.name}
              </div>
              <Button
                id={pack.packID}
                onClick={() => {
                  deletePack(pack.packID);
                }}
                className="bg-zinc-200 p-2 gigabold border-zinc-900 text-zinc-900 hover:scale-105 hover:text-zinc-900 transition-all cursor-pointer rounded-xl flex justify-center items-center"
              >
                Delete
              </Button>
            </div>
          );
        })}
        <div className="h-5rem flex justify-between gap-3">
          <div className="bg-zinc-800 hover:bg-zinc-700 group-focus:bg-zinc-700 text-zinc-200 font-bold p-2 rounded-xl text-center justify-center flex-grow ">
            <input
              type="text"
              value={packCode}
              onChange={(e) => setPackCode(e.target.value)}
              placeholder="Pack code"
              className="w-full bg-transparent outline-none placeholder:text-zinc-500 text-center"
            />
          </div>

          <Button
            id="add-pack"
            onClick={addPack}
            className="bg-zinc-200 p-2 border-zinc-900 gigabold text-zinc-900 hover:scale-105 hover:text-zinc-900 transition-all cursor-pointer rounded-xl flex justify-center items-center"
          >
            Add pack
          </Button>
        </div>
      </div>
    </div>
  );
}
