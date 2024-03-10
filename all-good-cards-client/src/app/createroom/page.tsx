import { Session } from "@/components/session/Session";
import CreateRoomClient from "./CreateRoom";

export default function CreateRoom({ params }: { params: { id: string } }) {
  return (
    <Session
      params={{
        id: "create",
      }}
    >
      <div className="w-full min-h-[100svh] flex items-center justify-center">
        <div className="gap-6 rounded-xl bg-zinc-900 shadow-2xl flex justify-between flex-col p-6 items-center">
          <CreateRoomClient />
        </div>
      </div>
    </Session>
  );
}
