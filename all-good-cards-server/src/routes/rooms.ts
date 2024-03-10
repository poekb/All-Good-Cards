import express, { Request, Response } from "express";
import {
  connectSocketToRoom,
  connectToRoom,
  getSession,
} from "../managers/sessionManager";
import { createRoom, getRoom } from "../managers/roomManager";

const router = express.Router();

router.post("/create", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }
  const roomID = createRoom(req.body.roomName, sessionID);

  connectToRoom(sessionID, roomID);

  res.json({ roomID: roomID });
});

router.post("/join", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = connectToRoom(sessionID, roomID);
  if (!room) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }
  res.json(room.getData(sessionID));
});

router.post("/playerlist", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);

  if (!room || !session.rooms.has(roomID)) {
    res.status(400);
    res.json({ error: "wrong room" });
    return;
  }

  res.json({ ownerID: room.ownerID, playerList: room.getActivePlayerList() });
});

router.post("/addpack", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);

  if (!room || sessionID !== room.ownerID) {
    res.status(300);
    res.json({ error: "don't have permission" });
    return;
  }

  await room.addPack(req.body.packCode);

  res.json({ packs: room.getPacks() });
});

router.post("/deletepack", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);

  if (!room || sessionID !== room.ownerID) {
    res.status(300);
    res.json({ error: "don't have permission" });
    return;
  }

  room.deletePack(req.body.packID);

  res.json({ packs: room.getPacks() });
});

router.post("/start", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.ownerID !== sessionID) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  room.startGame();

  res.json({
    text: "Game started",
  });
});

router.post("/end", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.ownerID !== sessionID) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  room.endGame();

  res.json({
    text: "Game ended",
  });
});

router.post("/rerollblack", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.game?.judge !== sessionID) {
    res.status(400);
    res.json({ error: "you are not the judge" });
    return;
  }

  room.game?.reRollBlack();

  res.json({
    black: room.game?.black,
  });
});

router.post("/startround", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.game?.judge !== sessionID) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  room.game?.startRound();

  res.json({
    text: "Round started",
  });
});

router.post("/updatehand", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.game?.judge === sessionID) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  const success = room.game?.updateHand(
    req.body.pick,
    req.body.order,
    sessionID
  );

  res.json({ success: success });
});

router.post("/submit", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.game?.judge === sessionID) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  let success = room.game?.updateHand(req.body.pick, req.body.order, sessionID);

  if (!success) {
    res.json({ success: success });
    return;
  }

  success = room.game?.submitPick(sessionID);

  res.json({ success: success });
});

router.post("/trashcards", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.game?.judge === sessionID) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  const result = room.game?.trashCards(sessionID);

  res.json(result);
});

router.post("/reveal", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.game?.judge !== sessionID) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  room.game?.revealNextPick();

  res.json({ message: "done" });
});

router.post("/pick", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  const index = req.body.index;
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || room.game?.judge !== sessionID) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  room.game?.pickBestCard(index);

  res.json({ message: "done" });
});

router.post("/nextround", async (req: Request, res: Response) => {
  const sessionID = req.body.sessionID;
  const roomID = req.body.roomID;
  const session = getSession(sessionID);
  const index = req.body.index;
  if (!session) {
    res.status(300);
    res.json({ error: "sessionID does not exist" });
    return;
  }

  const room = getRoom(roomID);
  if (!room || (room.game?.judge !== sessionID && room.ownerID !== sessionID)) {
    res.status(400);
    res.json({ error: "room does not exist" });
    return;
  }

  room.game?.nextRound();

  res.json({ message: "done" });
});

export default router;
