import { DisconnectReason, Socket } from "socket.io";
import { generateToken } from "../services/cryptography";
import { Queue } from "queue-typescript";
import { getRoom } from "./roomManager";

interface Session {
  username: string;
  rooms: Map<string, { socket: Socket; disconnected: Date | false }>;
}

var sessions = new Map<string, Session>();

function getSession(sessionID: string) {
  return sessions.get(sessionID);
}

function createSession(userName: string) {
  if (userName.length < 3) return false;
  let id;
  do {
    id = generateToken(32);
  } while (sessions.has(id));

  sessions.set(id, {
    username: userName,
    rooms: new Map<string, { socket: Socket; disconnected: Date | false }>(),
  });

  return id;
}

function connectToRoom(sessionID: string, roomID: string) {
  const session = sessions.get(sessionID);
  if (!session || typeof session == "undefined") return null;

  const room = getRoom(roomID);
  if (!room) return null;

  room.addPlayer(sessionID);

  return room;
}

function connectSocketToRoom(
  sessionID: string,
  socket: Socket,
  roomID: string
) {
  const session = sessions.get(sessionID);
  if (!session || typeof session == "undefined") return null;

  const room = getRoom(roomID);
  if (!room) return null;
  room.addActive(sessionID, socket);

  socket.conn.on("close", () => {
    const room = session.rooms.get(roomID);
    if (!room || socket !== room.socket) return;
    room.disconnected = new Date();

    shortDisconnectQueue.enqueue({ sessionID, roomID });
  });

  session.rooms.set(roomID, { socket: socket, disconnected: false });

  return room;
}

var shortDisconnectQueue = new Queue<{ sessionID: string; roomID: string }>();
var longDisconnectQueue = new Queue<{ sessionID: string; roomID: string }>();

function updateQueue(
  queue: Queue<{ sessionID: string; roomID: string }>,
  timeOutSecs: number,
  callBack: (sessionID: string, roomID: string) => void
) {
  const dateMils = new Date().valueOf();

  while (queue.length > 0) {
    const head = queue.head;

    const session = getSession(head.sessionID);

    if (session && typeof session.rooms.get(head.roomID) === "undefined") {
      queue.removeHead();
      continue;
    }
    const discTime = session?.rooms.get(head.roomID);

    if (
      typeof discTime !== "undefined" &&
      discTime.disconnected !== false &&
      discTime.disconnected.valueOf() + 1000 * timeOutSecs < dateMils
    ) {
      queue.removeHead();
      callBack(head.sessionID, head.roomID);
      continue;
    }
    break;
  }
}

async function onShortDisconnect(sessionID: string, roomID: string) {
  const session = sessions.get(sessionID);
  if (!session || typeof session === "undefined" || !roomID) return;

  const room = getRoom(roomID);
  if (room) room.passivePlayer(sessionID);

  longDisconnectQueue.enqueue({ sessionID: sessionID, roomID: roomID });
}

async function onFinalDisconnect(sessionID: string, roomID: string) {
  const session = sessions.get(sessionID);
  if (!session || typeof session == "undefined") return;

  const room = getRoom(roomID);
  if (room) room.deletePlayer(sessionID);
  session.rooms.delete(roomID);

  if (session.rooms.size === 0) {
    sessions.delete(sessionID);
  }
  //TODO: notify the rooms that the player has been deleted
}

async function updateDisconnects() {
  updateQueue(shortDisconnectQueue, 5, onShortDisconnect);

  updateQueue(longDisconnectQueue, 300, onFinalDisconnect);
}

export {
  getSession,
  createSession,
  connectSocketToRoom,
  updateDisconnects,
  connectToRoom,
};
