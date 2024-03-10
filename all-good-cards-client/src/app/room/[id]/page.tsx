import Packs from "@/components/room/Packs";
import Players from "@/components/room/Players";
import RoomStatus from "@/components/room/Status";
import Footer from "@/components/session/Footer";
import { Session } from "@/components/session/Session";
import postServerRequest from "@/services/http/serverRequestService";
import redirectFromStatus from "@/services/room/redirectStatus";
import { redirect } from "next/navigation";

export default async function RoomPage({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const response = await postServerRequest("/room/join", {
    roomID: params.id,
  });

  if (response.status === 400) {
    redirect("/createroom");
  }

  const roomData = await response.json();

  const roomName = roomData.roomName;

  return (
    <Session params={{ id: params.id }}>
      <div className="flex flex-col w-full min-h-[100svh] h-full overflow-hidden relative">
        <div className="w-full h-16 text-3xl font-bold text-white bg-zinc-900 flex items-center justify-center p-2">
          {roomName ? roomName : ""}
        </div>
        <div className="flex flex-row w-full h-full grow mb-20">
          <div className="flex-grow flex-col flex justify-start items-center">
            <Players
              params={{
                roomID: params.id,
                players: roomData.players,
              }}
            />
            <RoomStatus defRoomData={roomData}></RoomStatus>
          </div>
          {/*
        <div className="w-60 bg-zinc-700 h-full flex flex-col items-center justify-between p-4">
          <div className="text-xl font-bold text-white">Chat</div>
          <div></div>
        </div>
        */}
        </div>
        <div className="w-full h-32 text-xl font-bold text-white bg-zinc-900 flex items-center justify-center p-2 mt-auto">
          All Good Cards&nbsp;<span className=" font-light">©</span>
        </div>
      </div>
    </Session>
  );
}
