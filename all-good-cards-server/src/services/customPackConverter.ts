interface BlackCard {
  content: string;
  pick: number;
}

interface Pack {
  name: string;
  whites: string[];
  blacks: BlackCard[];
}

async function convertPack(packID: string): Promise<Pack | null> {
  try {
    const response = await fetch(
      "https://api.bad.cards/api/pack/get?pack=" + packID,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const body = await response.json();

    let blacks: BlackCard[] = [];
    body.definition.black.forEach(
      (element: { content: string; pick: number }) => {
        blacks.push({ content: element.content, pick: element.pick });
      }
    );

    let whites: string[] = [];
    body.definition.white.forEach((element: { content: string }) => {
      whites.push(element.content);
    });

    const name: string = body.definition.pack.name;
    const pack: Pack = {
      name: name,
      whites: whites,
      blacks: blacks,
    };

    return pack;
  } catch {
    return null;
  }
}

export default convertPack;

export { Pack, BlackCard };
