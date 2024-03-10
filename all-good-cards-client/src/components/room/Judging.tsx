interface CardPick {
  texts: string[];
  player: string;
}
import { useEffect, useState } from "react";
import { useSend, useSocketEvent } from "../session/ClientSession";
import BlackCard from "../cards/BlackCard";
import WhiteCard from "../cards/WhiteCard";
import PickCard from "../cards/PickCard";
import React from "react";
import Button, { UseClearLoading, UseRemoveLoading } from "../cards/Button";
export default function Judging({ roomData }: { roomData: any }) {
  const [currentPick, setCurrentPick] = useState<number>(
    roomData.currentPick | 0
  );

  const [pickChoosen, setPickChoosen] = useState<{
    pick: number;
    playerName: string;
  } | null>(roomData.pickChoosen);

  const send = useSend();
  const addListener = useSocketEvent();
  const removeLoading = UseRemoveLoading();
  const clearLoading = UseClearLoading();

  const incrementPick = async () => {
    if (!(currentPick < roomData.picks.length)) return;

    await send("/room/reveal", { roomID: roomData.roomID });
    removeLoading("reveal");
  };

  const pickBest = async (index: number) => {
    await send("/room/pick", { roomID: roomData.roomID, index: index });
    clearLoading();
  };

  const startNextRound = async () => {
    await send("/room/nextround", { roomID: roomData.roomID });
    clearLoading();
  };

  useEffect(() => {
    addListener("revealnext", (body) => {
      if (typeof body.currentPick === "number") {
        setCurrentPick(body.currentPick);
      }
    });
    addListener("roundwinner", (body) => {
      if (typeof body === "object") {
        setPickChoosen(body);
      }
    });
  });

  return (
    <div className=" flex flex-col items-center justify-start p-6 w-full gap-4">
      <div className="flex flex-row gap-4 flex-wrap items-center justify-center">
        <BlackCard text={roomData.black.content}></BlackCard>

        {currentPick >= 0 && currentPick < roomData.picks.length && (
          <div className="flex flex-wrap justify-center items-center gap-4">
            {roomData.picks[currentPick].texts.map(
              (text: string, n: number) => {
                return <WhiteCard key={n} text={text} hover={true}></WhiteCard>;
              }
            )}
          </div>
        )}
        {pickChoosen && (
          <div className="flex flex-wrap justify-center items-center gap-4">
            {roomData.picks[pickChoosen.pick].texts.map(
              (text: string, n: number) => {
                return <WhiteCard key={n} text={text} hover={true}></WhiteCard>;
              }
            )}
          </div>
        )}
      </div>
      {roomData.isJudge && currentPick < roomData.picks.length && (
        <Button
          id="reveal"
          onClick={incrementPick}
          className="p-3 h-fit text-2xl flex justify-center border-zinc-900 items-center bg-zinc-300 text-center rounded-xl gigabold hover:scale-105 cursor-pointer transition-all select-none"
        >
          {currentPick === -1
            ? "Reveal first"
            : currentPick < roomData.picks.length - 1
            ? "Reveal next"
            : "Start picking"}
        </Button>
      )}
      {currentPick == roomData.picks.length && !pickChoosen && (
        <div className="flex flex-wrap items-start justify-center gap-4">
          {roomData.picks.map((pick: CardPick, n: number) => {
            return (
              <React.Fragment key={n}>
                <PickCard
                  id={n.toString()}
                  sendPick={() => {
                    pickBest(n);
                  }}
                  texts={pick.texts}
                  isJudge={roomData.isJudge}
                ></PickCard>
              </React.Fragment>
            );
          })}
        </div>
      )}
      {pickChoosen && (
        <div className="grow text-3xl text-zinc-200 gigabold mt-14 small-caps">
          {pickChoosen.playerName} had the best card!
        </div>
      )}
      {pickChoosen && (roomData.isJudge || roomData.isOwner) && (
        <Button
          id="continue"
          onClick={startNextRound}
          className="p-3 h-fit text-2xl flex justify-center items-center bg-zinc-300 border-zinc-900 text-center rounded-xl gigabold hover:scale-105 cursor-pointer transition-all select-none"
        >
          Continue
        </Button>
      )}
    </div>
  );
}
