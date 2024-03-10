import { generateToken } from "../services/cryptography";
import { BlackCard, Pack } from "../services/customPackConverter";
import { Player, Room } from "./roomManager";
import { getSession } from "./sessionManager";

interface Hand {
  cards: string[];
  pick: number[];
  score: number;
  submitted: boolean;
  order: number[];
}

interface Card {
  holder: string;
  text: string;
}

interface Pick {
  texts: string[];
  player: string;
}
interface ChoosenPick {
  pick: number;
  playerName: string;
}

export default class Game {
  draws: number = 12;
  pointsToWin: number = 10;

  defaulWhites: string[] = [];
  defaulBlacks: BlackCard[] = [];

  whites: string[] = [];
  blacks: BlackCard[] = [];

  playable: boolean;

  hands: Map<string, Hand> = new Map<string, Hand>();
  cards: Map<string, Card> = new Map<string, Card>();
  picks: Pick[] = [];
  currentPick: number = -1;
  pickChoosen: ChoosenPick | null = null;

  black: BlackCard | null = null;
  started: boolean = false;
  judgingPhase: boolean = false;

  room: Room;

  players: Set<string> = new Set<string>();
  judge: string = "";

  ended = false;

  constructor(packs: Map<string, Pack>, players: string[], room: Room) {
    this.room = room;
    packs.forEach((pack) => {
      this.defaulWhites.push(...pack.whites);
      this.defaulBlacks.push(...pack.blacks);
    });
    this.shuffleWhites();
    this.shuffleBlacks();

    this.playable = this.whites.length > 0 && this.blacks.length > 0;
    this.players = new Set(players);

    if (this.playable) {
      this.deal();

      this.judge =
        Array.from(players)[Math.floor(Math.random() * this.players.size)];
    }
    this.newBlack();
  }

  reRollBlack() {
    if (this.started) return;

    if (this.blacks.length < 1) {
      this.shuffleBlacks();
    }
    this.newBlack();
  }

  newBlack() {
    if (this.blacks.length < 1) return;
    const newBlack = this.blacks.pop();
    if (typeof newBlack !== "undefined") this.black = newBlack;
  }

  eqSet(xs: Set<any>, ys: Set<any>) {
    return xs.size === ys.size && [...xs].every((x) => ys.has(x));
  }

  updateHand(pick: number[], order: number[], player: string) {
    if (!this.players.has(player) || player == this.judge) return false;

    const hand = this.hands.get(player);
    if (!hand) return false;

    if (
      (hand.submitted || !this.started) &&
      JSON.stringify(pick) != JSON.stringify(hand.pick)
    )
      return;
    const setOfNew = new Set<number>([...pick, ...order]);
    setOfNew.delete(-1);
    const realSet = new Set<number>(
      new Array(this.hands.get(player)?.cards.length).keys()
    );

    if (pick.length == hand.pick.length && this.eqSet(setOfNew, realSet)) {
      hand.order = order;
      hand.pick = pick;
      return true;
    } else {
      return false;
    }
  }

  revealNextPick() {
    if (this.currentPick < this.picks.length) {
      this.currentPick += 1;

      this.room.emitToAll("revealnext", {
        currentPick: this.currentPick,
        pickChoosen: this.pickChoosen,
      });
    }
  }

  startWinnerScreen() {
    this.ended = true;
    this.room.emitStatusChange();
  }

  pickBestCard(index: number) {
    const playerID = this.picks[index].player;

    const playerName = getSession(playerID)?.username;
    if (playerName === null || typeof playerName === "undefined") return;

    const hand = this.hands.get(playerID);
    if (hand) {
      hand.score++;
    }

    this.pickChoosen = {
      pick: index,
      playerName: playerName,
    };

    this.room.emitToAll("roundwinner", this.pickChoosen);
    this.room.notifyPlayerChange();
  }

  nextRound() {
    //TODO: check if game end conditions are met

    this.hands.forEach((hand) => {
      if (hand.score >= this.pointsToWin) {
        this.startWinnerScreen();
        return;
      }
    });

    this.players = new Set(this.room.getActivePlayers());
    this.deal();
    if (this.pickChoosen) {
      this.judge = this.picks[this.pickChoosen.pick].player;
    } else {
      this.judge = Array.from(this.players)[
        Math.floor(Math.random() * this.players.size)
      ];
    }
    this.newBlack();
    // Reseting the data
    this.currentPick = -1;
    this.pickChoosen = null;
    this.started = false;
    this.judgingPhase = false;
    this.hands.forEach((hand) => {
      hand.submitted = false;
      hand.pick = [];
    });
    this.room.emitStatusChange();
    this.room.notifyPlayerChange();
  }

  trashCards(player: string) {
    if (!this.players.has(player) || player == this.judge)
      return { pick: null, order: null };

    const hand = this.hands.get(player);
    if (!hand || hand.submitted) return { pick: null, order: null };

    hand.order = this.randomSort(Array.from(Array(hand.cards.length).keys()));

    hand.pick = hand.order.slice(0, this.black?.pick || 1);

    hand.order = [];
    this.submitPick(player);
    return { pick: hand.pick, order: hand.order };
  }

  submitPick(player: string) {
    if (!this.players.has(player) || player == this.judge) return false;

    const hand = this.hands.get(player);
    if (!hand) return false;

    const pickSet = new Set<number>([...hand.pick]);
    if (pickSet.has(-1)) return false;

    hand.submitted = true;

    //update status of ready players:
    this.room.notifyPlayerChange();
    //

    let isEveryOneReady = true;
    this.players.forEach((playerID) => {
      const hand = this.hands.get(playerID);
      if (!hand?.submitted) {
        isEveryOneReady = false;
      }
    });

    if (isEveryOneReady) {
      // finalize picks
      this.picks = [];

      this.players.forEach((playerID) => {
        if (this.judge == playerID) return;
        const hand = this.hands.get(playerID);
        if (!hand) return;
        // create pick

        const pickTexts: string[] = hand.pick.map((slot) => {
          const text = this.cards.get(hand.cards[slot])?.text;

          if (typeof text === "undefined") return "Failed to load card";

          return text;
        });

        this.picks.push({
          texts: pickTexts,
          player: playerID,
        });

        //remove picked cards from hand

        hand.pick
          .sort((a, b) => b - a)
          .forEach((pickSlot) => {
            const deleted = hand.cards.splice(pickSlot, 1);
            deleted.forEach((cardID) => this.cards.delete(cardID));
            hand.order = hand.order.map((slot) => {
              return slot > pickSlot ? slot - 1 : slot;
            });
          });
        if (hand.order.length === 0) hand.cards = [];
      });

      this.picks = this.randomSort(this.picks);

      //Start the judgeing process
      this.judgingPhase = true;
      this.room.emitStatusChange();
    }

    return true;
  }

  startRound() {
    this.started = true;

    const judge = this.hands.get(this.judge);
    if (judge) {
      judge.submitted = true;
    }

    this.hands.forEach((hand) => {
      hand.pick = new Array(this.black?.pick).fill(-1);
    });
    this.room.notifyPlayerChange();
    this.room.emitToAll("roundStart", {
      black: this.black,
      started: this.started,
    });
  }

  getHand(holder: string) {
    let cards: { id: string; text: string }[] = [];

    const hand = this.hands.get(holder);
    if (typeof hand === "undefined") return null;

    hand.cards.forEach((cardID) => {
      const card = this.cards.get(cardID);

      if (typeof card === "undefined") return;

      cards.push({
        id: cardID,
        text: card.text,
      });
    });

    return {
      cards: cards,
      pick: hand.pick,
      submitted: hand.submitted,
      order: hand.order,
    };
  }

  drawCard(holder: string): string {
    if (this.whites.length < 1) {
      this.shuffleWhites();
    }

    let text = this.whites.pop();

    if (typeof text === "undefined") {
      text = "Failed to load text";
    }

    let cardID: string;
    do {
      cardID = generateToken(12);
    } while (this.cards.has(cardID));
    this.cards.set(cardID, {
      holder: holder,
      text: text,
    });

    return cardID;
  }

  deal() {
    this.players.forEach((sessionID) => {
      if (!this.hands.has(sessionID)) {
        this.hands.set(sessionID, {
          cards: [],
          pick: [],
          score: 0,
          submitted: false,
          order: [],
        });
      }

      const hand = this.hands.get(sessionID);
      if (typeof hand === "undefined") return;
      while (hand.cards.length < 12) {
        const cardID = this.drawCard(sessionID);
        hand.order.push(hand.cards.length);
        hand.cards.push(cardID);
      }
    });
  }

  removePlayer(sessionID: string) {
    this.players.delete(sessionID);

    //TODO: if judge quit then skip the round
    if (sessionID === this.judge) {
      // Give the picked cards back to the deck
      this.hands.forEach((hand) => {
        const pick = new Set(hand.pick);
        pick.delete(-1);
        hand.order.push(...pick);
      });
      this.nextRound();
      //this.room.emitStatusChange();
    }

    if (this.players.size < 2) {
      // not sufficent players for playing

      this.room.stopGame();
    }
  }

  deletePlayer(sessionID: string) {
    this.removePlayer(sessionID);
    const hand = this.hands.get(sessionID);
    hand?.cards.forEach((cardID) => {
      this.cards.delete(cardID);
    });
    this.hands.delete(sessionID);
  }

  shuffleWhites() {
    this.whites = this.randomSort(this.defaulWhites);
  }
  shuffleBlacks() {
    this.blacks = this.randomSort(this.defaulBlacks);
  }

  randomSort(list: any[]) {
    return [...list].sort(() => Math.random() - 0.5);
  }
}
