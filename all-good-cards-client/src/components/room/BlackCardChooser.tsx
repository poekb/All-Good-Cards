import { useEffect, useState } from "react";
import { useSend, useSocketEvent } from "../session/ClientSession";
import BlackCard from "../cards/BlackCard";
import Button, { UseRemoveLoading } from "../cards/Button";
export default function BlackCardChooser({ roomData }: { roomData: any }) {
  const defText: string = roomData.black.content;

  const [text, setText] = useState(defText);
  const [started, setStarted] = useState(roomData.started);

  const sendMessage = useSend();

  const removeLoading = UseRemoveLoading();

  async function swapCard() {
    const response = await sendMessage("/room/rerollblack", {
      roomID: roomData.roomID,
    });

    if (response) {
      setText(response.black.content);
    }
    removeLoading("swap");
  }

  async function startRound() {
    const response = await sendMessage("/room/startround", {
      roomID: roomData.roomID,
    });

    if (response) {
      setStarted(true);
    }
    removeLoading("start");
  }

  return (
    <>
      <div className=" p-4 flex flex-row justify-center">
        <BlackCard text={text}></BlackCard>
      </div>
      {started ? (
        <></>
      ) : (
        <div className=" p-4 pt-0 flex flex-row justify-center">
          <div className="w-[25rem] h-fit flex flex-row justify-between items-center">
            <Button
              id="swap"
              onClick={swapCard}
              className="p-3 h-12 text-lg flex justify-center items-center bg-zinc-300 border-zinc-900 text-center rounded-xl"
            >
              Swap card
            </Button>
            <Button
              id="start"
              onClick={startRound}
              className="p-3 h-12 text-lg flex justify-center items-center select-none bg-zinc-300 border-zinc-900 text-center rounded-xl"
            >
              Start round
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
