import React from "react";

export default function Hyphener({ text }: { text: string }) {
  //text = "anyád Megbasdasdasdasdam a";
  const words = text.split(" ");

  let maxLength = 0;
  words.forEach((word) => {
    if (word.length > maxLength) maxLength = word.length;
  });

  const size = Math.min(
    80 / Math.sqrt(maxLength) / Math.pow(words.length / 2, 0.2),
    20
  );
  return (
    <div
      lang="hu"
      className={
        "font-extrabold select-none text-center items-start gigabold justify-center flex flex-row flex-wrap "
      }
      style={{ fontSize: size }}
    >
      {/*&#x2001;Tüsszentés, &#x2001;fingás &#x2001;és &#x2001;elélvezés
      &#x2001;ugyanabbanasda &#x2001;a &#x2001;pillanatban*/}

      {/*&#8203;Megbasztamasdasd &#8203;anyádasdasd*/}
      {words.map((word, id) => {
        return (
          <div
            key={id}
            lang="hu"
            className="w-fit text-that-needs-wrapping text-balance hyphens-auto"
          >
            {word}&nbsp;
          </div>
        );
      })}
    </div>
  );
}
