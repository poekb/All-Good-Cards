import { motion } from "framer-motion";
import Hyphener from "./Hyphener";

export default function BlackCard({ text }: { text: string }) {
  const content = replaceBlanks(text);
  function replaceBlanks(text: string) {
    return text.replaceAll("_", "_______");
  }

  return (
    <motion.div
      layoutId="blackCard"
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      lang="en"
      className={
        "min-w-[25rem] w-[25rem] h-60 bg-zinc-950 shadow-2xl  text-zinc-200 font-extrabold p-4 rounded-xl text-2xl text-center flex justify-center items-center text-that-needs-wrapping"
      }
    >
      <Hyphener text={content}></Hyphener>
    </motion.div>
  );
}
