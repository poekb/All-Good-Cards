"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useCookies } from "next-client-cookies";
import Button, { UseClearLoading } from "@/components/cards/Button";

export default function CreateSessionPage() {
  const [username, setUsername] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const cookies = useCookies();

  const clearLoading = UseClearLoading();

  const createSession = async () => {
    console.log(process.env.NEXT_PUBLIC_SERVER_URL);

    const response = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/session/create",
      {
        method: "POST",
        body: JSON.stringify({
          username: username,
        }),
        headers: {
          "content-type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const responseBody = await response.json();
    clearLoading();

    if (response.ok) {
      cookies.set("sessionID", responseBody.sessionID);

      router.push("/room/" + searchParams.get("callback"));
      return;
    }
  };

  return (
    <div className="w-full min-h-[100svh] flex items-center justify-center">
      <div className="gap-6 rounded-xl bg-zinc-900 shadow-2xl flex justify-between flex-col p-6 items-center">
        <div className=" gigabold text-3xl text-zinc-200">
          Choose a nickname
        </div>
        <div className=" bg-zinc-800 w-5/6 rounded-xl">
          <input
            type="text"
            name="username"
            placeholder="Nickname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className=" rounded-xl font-bold text-center outline-none text-xl text-zinc-200 p-[0.625rem] w-full bg-zinc-800 autofill:!bg-zinc-700"
          />
        </div>

        <Button
          id="join"
          className="w-5/6 items-center flex justify-center border-zinc-900 gigabold text-2xl text-zinc-900 bg-zinc-200 rounded-xl p-2"
          onClick={createSession}
        >
          Join
        </Button>
      </div>
    </div>
  );
}
