import { Server, Socket } from "socket.io";
import { connectSocketToRoom } from "./sessionManager";

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

export { io };

/*
io.on("connection", (socket) => {
  const sessionID: string = socket.handshake.auth.sessionID;

  if (connectSocket(sessionID, socket)) {
    socket.emit("hello", { text: "Hello from server!" });
  } else {
    socket.disconnect();
  }
});*/

io.on("connection", (socket) => {
  const sessionID: string = socket.handshake.auth.sessionID;

  const roomID: string = socket.handshake.auth.roomID;

  const room = connectSocketToRoom(sessionID, socket, roomID);

  if (!room) {
    socket.disconnect();
  }
});
