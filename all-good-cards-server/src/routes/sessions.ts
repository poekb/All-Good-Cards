import express, { Request, Response } from "express";
import { createSession, getSession } from "../managers/sessionManager";
const router = express.Router();

router.post("/create", async (req: Request, res, Response) => {
  const sessionID = createSession(req.body.username);
  if (!sessionID) {
    res.status(300);
    res.json({ error: "Name too short" });
    return;
  }

  res.json({ sessionID: sessionID });
});

router.post("/getsession", async (req: Request, res, Response) => {
  const sessionID = req.body.sessionID;

  const session = getSession(sessionID);

  if (typeof session === "undefined") {
    res.status(400);
    res.json({ error: "not found" });
    return;
  }

  res.status(200);
  res.json({ session: { username: session.username } });
});

export default router;
