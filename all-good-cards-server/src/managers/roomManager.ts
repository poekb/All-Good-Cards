import { Socket } from "socket.io";
import { generateToken } from "../services/cryptography";
import convertPack, { Pack } from "../services/customPackConverter";
import Game from "./gameManager";
import { getSession } from "./sessionManager";
import { io } from "./socketManager";

interface Player {
  active: boolean;
  socket: Socket | null;
}
enum Status {
  options,
  waiting,
  blackPicker,
  judge,
  player,
  spectator,
  ended,
}

export class Room {
  id: string;
  name: string;
  ownerID: string;

  players: Map<string, Player>;

  packs: Map<string, Pack>;

  roomNamespace;

  game?: Game;

  constructor(id: string, name: string, ownerID: string) {
    this.id = id;
    this.name = name;
    this.ownerID = ownerID;

    this.players = new Map<string, Player>();
    this.packs = new Map<string, Pack>();

    this.roomNamespace = io.of("/room/" + id);
  }

  startGame() {
    let players: Set<string> = new Set<string>();

    this.players.forEach((player, id) => {
      if (player.active) {
        players.add(id);
      }
    });
    if (players.size < 2) return;

    this.game = new Game(this.packs, this.getActivePlayers(), this);
    if (!this.game.playable) delete this.game;

    this.emitStatusChange();
    this.notifyPlayerChange();
  }

  getData(sessionID: string) {
    const status = this.getStatus(sessionID);

    return {
      roomID: this.id,
      roomName: this.name,
      players: {
        ownerID: this.ownerID,
        playerList: this.getActivePlayerList(),
      },
      isOwner: sessionID === this.ownerID,
      isJudge: sessionID === this.game?.judge,
      status: status,
      packs: this.getPacks(),
      hand: status ? this.game?.getHand(sessionID) : null,
      black: this.game?.black,
      started: this.game?.started,
      picks: status === Status.judge ? this.game?.picks : null,
      currentPick: status === Status.judge ? this.game?.currentPick : null,
      pickChoosen: status === Status.judge ? this.game?.pickChoosen : null,
    };
  }

  stopGame() {
    delete this.game;

    this.emitStatusChange();
  }

  getActivePlayers() {
    const result: string[] = [];
    this.players.forEach((player, id) => {
      if (player.active) result.push(id);
    });
    return result;
  }

  getActivePlayerList() {
    var resultList: {
      id: string;
      name: string | undefined;
      score: number;
      ready: boolean;
    }[] = [];

    if (this.game) {
      this.game.players.forEach((id) => {
        const hand = this.game?.hands.get(id);
        const session = getSession(id);

        if (!hand) return;

        resultList.push({
          id: id,
          name: session?.username,
          score: hand.score,
          ready: hand.submitted,
        });
      });
    } else {
      this.players.forEach((player, id) => {
        if (player.active) {
          const session = getSession(id);

          resultList.push({
            id: id,
            name: session?.username,
            score: 0,
            ready: true,
          });
        }
      });
    }

    return resultList;
  }

  async addPack(packCode: string) {
    const pack = await convertPack(packCode);

    if (!pack) {
      return false;
    }

    var id;
    do {
      id = generateToken(16);
    } while (this.packs.has(id));

    this.packs.set(id, pack);

    return true;
  }

  getPacks() {
    var packList: { packID: string; name: string }[] = [];
    this.packs.forEach((pack, id) => {
      packList.push({
        packID: id,
        name: pack.name,
      });
    });
    return packList;
  }

  deletePack(packID: string) {
    this.packs.delete(packID);
  }
  endGame() {
    delete this.game;
    this.emitStatusChange();
    this.notifyPlayerChange();
  }

  getStatus(id: string): Status {
    if (this.game) {
      if (this.game.ended) {
        return Status.ended;
      }

      if (this.game.judgingPhase) {
        return Status.judge;
      }

      if (this.game.judge === id) {
        return Status.blackPicker;
      }

      if (this.game.players.has(id)) {
        return Status.player;
      }

      return Status.spectator;
    }

    if (this.ownerID === id) {
      return Status.options;
    }
    return Status.waiting;
  }

  passivePlayer(id: string) {
    const player = this.players.get(id);
    if (player) player.active = false;
    this.game?.removePlayer(id);

    this.updateOwnership(id);
    this.notifyPlayerChange();
  }

  updateOwnership(id: string) {
    if (id === this.ownerID) {
      function test(room: Room) {
        for (let [sessionID, player] of room.players) {
          if (player.active) {
            room.ownerID = sessionID;
            return false;
          }
        }
        return true;
      }

      if (test(this)) {
        rooms.delete(this.id);
      }
      this.emitStatusChange();
    }
  }

  deletePlayer(id: string) {
    this.game?.deletePlayer(id);
    this.players.delete(id);
    this.updateOwnership(id);
    this.notifyPlayerChange();
  }

  addActive(id: string, socket: Socket) {
    this.players.get(id)?.socket?.disconnect();
    this.players.set(id, {
      active: true,
      socket: socket,
    });
    this.notifyPlayerChange();
  }

  addPlayer(id: string) {
    if (this.players.has(id)) return;
    this.players.set(id, {
      active: false,
      socket: null,
    });
    this.notifyPlayerChange();
  }

  emitStatusChange() {
    this.players.forEach((player, id) => {
      player.socket?.emit("statusChange", this.getData(id));
    });
  }

  emitToAll(event: string, body: {}) {
    this.players.forEach((player, id) => {
      player.socket?.emit(event, body);
    });
  }

  emitToStatus(event: string, body: {}, status: number) {
    this.players.forEach((player, id) => {
      if (this.getStatus(id)) {
        player.socket?.emit(event, body);
      }
    });
  }

  notifyPlayerChange() {
    this.emitToAll("player", {
      ownerID: this.ownerID,
      playerList: this.getActivePlayerList(),
    });
  }
}

var rooms = new Map<string, Room>();

function createRoom(name: string, ownerID: string) {
  var id: string;
  do {
    id = generateToken(32);
  } while (rooms.has(id));

  rooms.set(id, new Room(id, name, ownerID));
  return id;
}

function getRoom(id: string): Room | null {
  const room = rooms.get(id);
  if (typeof room === "undefined") return null;
  return room;
}

export { createRoom, getRoom, Player, Status };
