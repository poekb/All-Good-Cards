import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useClientMousePosition } from "./mouseFollow";

var mouse = { x: 0, y: 0 };

const useMouseSlot = (
  picRefs: React.RefObject<HTMLDivElement>[],
  refs: React.RefObject<HTMLDivElement>[],
  draggingCard: { x: number; y: number; index: number }
) => {
  const [slot, setSlot] = useState(-1);
  useEffect(() => {
    const update = () => {
      let found = false;

      for (let i = 0; i < refs.length; i++) {
        if (!refs[i]?.current) continue;
        const ref = refs[i].current?.getBoundingClientRect();

        if (
          ref &&
          mouse.x - draggingCard.x + ref.width / 2 > ref.left &&
          mouse.y - draggingCard.y + ref.height / 2 > ref.top &&
          mouse.x - draggingCard.x + ref.width / 2 < ref.left + ref.width &&
          mouse.y - draggingCard.y + ref.height / 2 < ref.top + ref.height
        ) {
          if (slot != i) {
            setSlot(i);
          }
          found = true;
          break;
        }
      }

      for (let i = 0; i < picRefs.length; i++) {
        if (!picRefs[i]?.current) continue;
        const ref = picRefs[i].current?.getBoundingClientRect();

        if (
          ref &&
          mouse.x - draggingCard.x + ref.width / 2 > ref.left &&
          mouse.y - draggingCard.y + ref.height / 2 > ref.top &&
          mouse.x - draggingCard.x + ref.width / 2 < ref.left + ref.width &&
          mouse.y - draggingCard.y + ref.height / 2 < ref.top + ref.height
        ) {
          if (slot != -i - 1) {
            setSlot(-i - 1);
          }
          found = true;
          break;
        }
      }

      if (!found) {
        if (slot != -1) {
          setSlot(-1);
        }
      }
    };

    const updateMousePosition = (ev: MouseEvent) => {
      mouse = { x: ev.clientX, y: ev.clientY };

      if (draggingCard.index != -1) update();
      else {
        if (slot != -1) {
          setSlot(-1);
        }
      }
      //setClientPosition({ x: ev.clientX, y: ev.clientY });
    };
    if (draggingCard.index != -1) update();
    window.addEventListener("mousemove", updateMousePosition);
    //window.addEventListener("scroll", updateScroll);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      //window.addEventListener("scroll", updateScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingCard, draggingCard, draggingCard, refs]);

  return slot;
};

export default useMouseSlot;
