import Hyphener from "./Hyphener";

export default function WhiteCard({
  text,
  hover,
}: {
  text: string;
  hover?: boolean;
}) {
  return (
    <div
      lang="hu"
      className={
        "bg-zinc-300 w-52 h-60 shadow-2xl z-10 rounded-xl scale-100 text-zinc-900 p-3 flex justify-center items-center transition-all duration-300 select-none " +
        (!hover && "hover:scale-105 ")
      }
    >
      <Hyphener text={text}></Hyphener>
    </div>
  );
}
