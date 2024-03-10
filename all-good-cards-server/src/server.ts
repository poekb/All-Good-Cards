import express, { Express, Request, Response } from "express";
import https from "https";
import fs from "fs";

import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

const app: Express = express();

const PORT = process.env.PORT || 8080;

app.use(cors(), express.json());

//TODO: setting up routes
import roomRouter from "./routes/rooms";
import sessionRouter from "./routes/sessions";
import convertPack from "./services/customPackConverter";
import { io } from "./managers/socketManager";
import { updateDisconnects } from "./managers/sessionManager";

app.use("/room", roomRouter);
app.use("/session", sessionRouter);

app.get("/", (req: Request, res: Response) => {
  res.send(`Hello from server! \nYou said: ${req.query.message}`);
});

const sslLocation = process.env.SSL_URI || "";

const options = {
  key: fs.readFileSync(sslLocation + ".key"),
  cert: fs.readFileSync(sslLocation + ".crt"),
};

const httpsServer = https.createServer(options, app);

//TODO: init socket.io to listen on the same port

io.listen(httpsServer);

const server = httpsServer.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
  setInterval(updateDisconnects, 1000);
});

export { httpsServer };

export default httpsServer;
