import useMousePosition from "@/services/general/mouseFollow";
import Hyphener from "./Hyphener";
import WhiteCard from "./WhiteCard";
import { motion } from "framer-motion";
import { Card } from "../room/WhiteCardChooser";
import { useEffect, useRef } from "react";

export default function DragCard({
  cards,
  offset,
  index,
  finishDrag,
}: {
  cards: Card[];
  offset: { x: number; y: number };
  index: number;
  finishDrag: () => void;
}) {
  const mousePoition = useMousePosition();

  return (
    <>
      {index !== -1 && (
        <motion.div
          layoutId={"card-" + index.toString()}
          initial={{ scale: 1.05 }}
          animate={{ zIndex: 100 }}
          onMouseUp={finishDrag}
          transition={spring}
          className="absolute z-50 cursor-grabbing"
          style={{
            left: mousePoition.x + offset.x, //offset.x,
            top: mousePoition.y + offset.y, //offset.y,
          }}
        >
          <div className="relative">
            <div
              className="absolute -inset-96 z-10"
              onMouseLeave={finishDrag}
            ></div>
            <WhiteCard text={cards[index].text} hover={true}></WhiteCard>
          </div>
        </motion.div>
      )}
    </>
  );
}

const spring = {
  delay: -2,
};
