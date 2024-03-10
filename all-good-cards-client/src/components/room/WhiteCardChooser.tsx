import { useEffect, useRef, useState } from "react";
import { useSend, useSocketEvent } from "../session/ClientSession";
import BlackCard from "../cards/BlackCard";
import Hyphener from "../cards/Hyphener";
import { motion, AnimateSharedLayout } from "framer-motion";
import React from "react";
import useMousePosition, {
  useClientMousePosition,
} from "@/services/general/mouseFollow";
import WhiteCard from "../cards/WhiteCard";
import DragCard from "../cards/DragCard";
import WhiteCardMotionDiv from "../cards/WhiteCardMotionDiv";
import useMouseSlot from "@/services/general/mouseIndexer";
import Button, { UseRemoveLoading } from "../cards/Button";

export interface Card {
  id: string;
  text: string;
  slot: number;
}
var topZ = -1;
export default function WhiteCards({ roomData }: { roomData: any }) {
  var refs: React.RefObject<HTMLDivElement>[] = [];
  var picRefs: React.RefObject<HTMLDivElement>[] = [];

  const cards: Card[] = roomData.hand.cards;
  const defOrder: number[] = roomData.hand.order;
  const defPick: number[] = roomData.hand.pick;

  const addListener = useSocketEvent();
  const send = useSend();
  const removeLoading = UseRemoveLoading();

  const defBlack: { content: string; pick: number } = roomData.black;

  const [order, setOrder] = useState(defOrder);
  const [pick, setPick] = useState(defPick);
  const [draggingCard, setDraggingCard] = useState({ x: 0, y: 0, index: -1 });
  const [started, setStarted] = useState(roomData.started);
  const [black, setBlack] = useState(defBlack);
  const [submitted, setSubmitted] = useState<boolean>(roomData.hand.submitted);

  const overSlot = useMouseSlot(picRefs, refs, draggingCard);

  function dragCard(event: MouseEvent, slot: number) {
    //Initiate the moveing of a card

    const isPick = slot < 0;
    if (isPick) slot = -slot - 1;
    const newList = isPick ? [...pick] : [...order];
    const rect = document
      .getElementById("card-" + newList[slot].toString())
      ?.getBoundingClientRect();
    let pos = { x: event.clientX, y: event.clientY };
    if (rect) {
      pos = { x: rect.left, y: rect.top };
    }

    setDraggingCard({
      x: event.clientX - pos.x,
      y: event.clientY - pos.y,
      index: newList[slot],
    });

    isPick ? (newList[slot] = -1) : newList.splice(slot, 1);
    isPick ? setPick(newList) : setOrder(newList);
  }
  async function trashCards() {
    const result = await send("/room/trashcards", {
      roomID: roomData.roomID,
    });
    if (!result.pick) return;
    setPick(result.pick);
    setOrder(result.order);
    setSubmitted(true);
    removeLoading("trash");
  }
  async function submit() {
    const result = await send("/room/submit", {
      roomID: roomData.roomID,
      pick: pick,
      order: order,
    });

    setSubmitted(result.success);

    removeLoading("submit");
  }

  function finishDrag() {
    {
      // Handle the ending if a drag
      topZ = draggingCard.index;

      if (overSlot >= 0) {
        const newOrder = [...order];
        newOrder.splice(overSlot, 0, draggingCard.index);
        setOrder(newOrder);
        updateServer(pick, newOrder);
      } else if (overSlot <= -2 && !submitted) {
        const newPick = [...pick];
        const index = -overSlot - 2;
        newPick[index] = draggingCard.index;

        setPick(newPick);
        if (pick[index] != -1) {
          const newOrder = [...order];
          newOrder.push(pick[index]);
          setOrder(newOrder);
          updateServer(newPick, newOrder);
        } else {
          updateServer(newPick, order);
        }
      } else {
        {
          const newOrder = [...order];
          newOrder.push(draggingCard.index);
          setOrder(newOrder);
          updateServer(pick, newOrder);
        }
      }

      setDraggingCard({ x: 0, y: 0, index: -1 });
    }
  }

  function clickCard(slot: number) {
    if (slot < 0) {
      const index = -slot - 1;

      const current = pick[index];
      const newPick = [...pick];

      newPick.splice(index, 1);
      newPick.push(-1);
      const newOrder = [...order];
      newOrder.push(current);

      setOrder(newOrder);
      setPick(newPick);
      updateServer(newPick, newOrder);
      topZ = current;
    } else {
      const pickIndex = pick.findIndex((x) => x == -1);
      if (pickIndex != -1) {
        const newPick = [...pick];
        newPick[pickIndex] = order[slot];

        const newOrder = [...order];
        newOrder.splice(slot, 1);
        setOrder(newOrder);
        setPick(newPick);
        updateServer(newPick, newOrder);
      }
    }
  }

  async function updateServer(newPick: number[], newOrder: number[]) {
    const result = await send("/room/updatehand", {
      roomID: roomData.roomID,
      pick: newPick,
      order: newOrder,
    });
  }

  const finalOrder =
    draggingCard.index == -1
      ? order
      : overSlot == -1
      ? [...order, -1]
      : overSlot > -1
      ? [...order.slice(0, overSlot), -1, ...order.slice(overSlot)]
      : [...order, -1];

  useEffect(() => {
    addListener("roundStart", (body) => {
      setPick(new Array(body.black.pick).fill(-1));
      setBlack(body.black);
      setStarted(body.started);
    });
  });

  return (
    <div draggable="false" className="select-none flex flex-col items-center">
      <div className=" p-4 pt-0 flex flex-row flex-wrap justify-center items-end gap-4">
        {started ? (
          <>
            <div
              className="flex flex-wrap gap-4 justify-center items-center"
              style={{ zIndex: submitted ? 0 : 10 }}
            >
              <BlackCard text={black.content}></BlackCard>
              <div className="flex flex-row gap-4 flex-wrap justify-center items-center relative  z-10">
                {submitted && (
                  <div className="absolute -inset-2 bg-black opacity-60 flex justify-center items-center rounded-2xl z-[35]">
                    <div className=" rotate-45 text-white gigabold text-4xl ">
                      Submitted
                    </div>
                  </div>
                )}
                {pick.map((i, n) => {
                  const card = cards[i];

                  return (
                    <div key={n} className="w-52 h-60">
                      <Slot
                        refs={picRefs}
                        slot={-n - 1}
                        backGround={true}
                      ></Slot>
                      {card && (
                        <div
                          style={{ zIndex: i == topZ ? 30 : 20 }}
                          className="absolute"
                        >
                          {submitted ? (
                            <WhiteCard text={card.text}></WhiteCard>
                          ) : (
                            <WhiteCardMotionDiv
                              slot={-n - 1}
                              index={i}
                              card={card}
                              onDrag={dragCard}
                              onClick={clickCard}
                            ></WhiteCardMotionDiv>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {!submitted && (
              <Button
                id="submit"
                onClick={submit}
                className="p-3 h-fit w-24 text-xl flex justify-center items-center bg-zinc-300 border-zinc-900 text-center rounded-xl gigabold hover:scale-105 cursor-pointer transition-all"
              >
                Submit
              </Button>
            )}
          </>
        ) : (
          <motion.div
            layoutId="blackCard"
            className={
              "w-[25rem] h-60 bg-zinc-600 shadow-2xl  text-zinc-200 font-extrabold p-4 rounded-xl text-2xl text-center flex justify-center items-center"
            }
          >
            Waiting for the judge to start the round...
          </motion.div>
        )}
      </div>
      <div className="w-5/6 h-1 rounded-full bg-zinc-600 mb-3"></div>
      <DragCard
        cards={cards}
        offset={{
          x: -draggingCard.x,
          y: -draggingCard.y,
        }}
        index={draggingCard.index}
        finishDrag={finishDrag}
      ></DragCard>
      <motion.div
        layoutId="card-deck"
        animate={{ height: "auto" }}
        className={
          "w-full flex flex-row flex-wrap items-start justify-center p-2 gap-4"
        }
      >
        {finalOrder.map((i, n) => {
          const card = cards[i];

          return (
            <React.Fragment key={i}>
              <div className="w-52 h-60">
                <Slot refs={refs} slot={n} backGround={false}></Slot>
                {card && (
                  <div
                    style={{ zIndex: i != -1 && i == topZ ? 10 : 6 }}
                    className="absolute"
                  >
                    <WhiteCardMotionDiv
                      slot={n}
                      index={i}
                      card={card}
                      onDrag={dragCard}
                      onClick={clickCard}
                    ></WhiteCardMotionDiv>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </motion.div>
      {order.length > 0 && (
        <div className="w-5/6 h-1 rounded-full bg-zinc-600 mt-3"></div>
      )}
      <div className="h-12 m-6">
        {!submitted && started && (
          <Button
            id="trash"
            onClick={trashCards}
            className="p-3 h-12 text-lg flex justify-center items-center bg-zinc-300 border-zinc-900 text-center rounded-xl gigabold hover:scale-105 cursor-pointer transition-all"
          >
            My cards suck
          </Button>
        )}
      </div>
    </div>
  );
}

function Slot({
  slot,
  backGround,
  refs,
}: {
  slot: number;
  backGround?: boolean;
  refs: React.RefObject<HTMLDivElement>[];
}) {
  //const [isInside, setIsInside] = useState(false);

  const ref = React.useRef<HTMLDivElement>(null);

  if (ref.current) refs[Math.abs(slot)] = ref;
  useEffect(() => {}, [ref]);

  return (
    <div
      ref={ref}
      className={
        "slot absolute w-52 h-60 " + (backGround && "rounded-xl bg-zinc-700")
      }
      style={{ zIndex: 5 }}
    ></div>
  );
}
const spring = {
  ease: "easeInOut",
  stiffness: 100,
  damping: 30,
  duration: 1,
};
