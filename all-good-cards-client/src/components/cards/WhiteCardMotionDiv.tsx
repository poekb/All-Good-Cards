import React from "react";
import Hyphener from "./Hyphener";
import { delay, easeInOut, motion } from "framer-motion";
import { Card } from "../room/WhiteCardChooser";
import WhiteCard from "./WhiteCard";

export default function WhiteCardMotionDiv({
  slot,
  index,
  card,
  onClick,
  onDrag,
}: {
  slot: number;
  index: number;
  card: Card;
  onClick: (n: number) => void;
  onDrag: (e: MouseEvent, n: number) => void;
}) {
  function initDrag() {
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", click);
  }

  function drag(e: MouseEvent) {
    if (Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2) < 2) return;
    onDrag(e, slot);
    clear();
  }

  function click() {
    onClick(slot);
    clear();
  }

  function clear() {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", click);
  }

  return (
    <React.Fragment key={index}>
      <motion.div
        layoutId={"card-" + index.toString()}
        id={"card-" + index.toString()}
        initial={false}
        className="w-52 h-60 cursor-pointer absolute"
        transition={spring}
        onMouseLeave={clear}
        onMouseDown={() => {
          initDrag();
        }}
      >
        <WhiteCard text={card.text}></WhiteCard>
      </motion.div>
    </React.Fragment>
  );
}

const spring = {
  ease: "easeInOut",
  stiffness: 100,
  damping: 30,
  duration: 0.5,
  delay: 0.1,
};
