import React from "react";
import Hyphener from "./Hyphener";
import Button from "./Button";

export default function PickCard({
  texts,
  isJudge,
  sendPick,
  id,
}: {
  texts: string[];
  isJudge: boolean;
  sendPick: () => any;
  id: string;
}) {
  return (
    <div
      lang="hu"
      className={
        "bg-zinc-300 w-64 min-h-72 shadow-2xl z-10 rounded-xl scale-100 text-zinc-900 p-3 flex justify-end items-center transition-all duration-300 select-none flex-col gap-2 "
      }
    >
      <div className=" flex flex-col gap-2 justify-evenly items-center grow">
        {texts.map((text, n) => {
          return (
            <React.Fragment key={n}>
              <Hyphener text={text}></Hyphener>
              {n < texts.length - 1 && (
                <div className="bg-zinc-500 w-5/6 h-1 rounded-xl"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {isJudge && (
        <Button
          id={"pick-" + id}
          onClick={sendPick}
          className="p-2 h-fit text-xl w-24 flex justify-center items-center border-zinc-200 bg-zinc-900 text-zinc-200 ml-auto text-center rounded-xl "
        >
          Pick
        </Button>
      )}
    </div>
  );
}
