"use client";

import { useCookies } from "next-client-cookies";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

interface SessionData {
  socket?: Socket;
  sessionID?: string;
}

const sessionIDContext = createContext<SessionData | null>(null);

var clientSession: SessionData = {};

export default function ClientSession({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const cookies = useCookies();

  useEffect(() => {
    if (!clientSession.sessionID) {
      const sessionID = cookies.get("sessionID");
      if (typeof sessionID !== "undefined") {
        clientSession.sessionID = sessionID;
      }
    }

    if (!clientSession.socket && params.id && params.id.length > 0) {
      console.log(
        (process.env.NEXT_PUBLIC_WS_URL || "wss://api.poekb.com") + "/room-101"
      );

      const socket = io(
        process.env.NEXT_PUBLIC_WS_URL || "wss://api.poekb.com",
        {
          auth: {
            sessionID: clientSession.sessionID,
            roomID: params.id,
          },
        }
      );
      socket.on("connect", () => {
        console.log("connected");
      });
      socket.onAny((event, body) => {
        listeners.get(event)?.(body);
      });

      clientSession.socket = socket;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <sessionIDContext.Provider value={clientSession}>
      {children}
    </sessionIDContext.Provider>
  );
}

var listeners = new Map<string, (body: any) => void>();

function useSocketEvent() {
  function addSocketEvent(event: string, callback: (body: any) => void) {
    listeners.set(event, callback);
  }
  return addSocketEvent;
}

function useSend() {
  const session = useContext(sessionIDContext);

  const postMessage = async (route: string, body: {}) => {
    if (!session || typeof session?.sessionID === "undefined") return;

    const result = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + route, {
      method: "POST",
      body: JSON.stringify({ ...body, sessionID: session?.sessionID }),
      headers: {
        "content-type": "application/json",
        Accept: "application/json",
      },
    });
    if (!result.ok) return false;
    return await result.json();
  };

  return postMessage;
}

export { useSend, useSocketEvent };
