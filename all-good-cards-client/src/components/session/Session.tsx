import { RedirectType, redirect } from "next/navigation";
import React, { useState } from "react";
import { cookies } from "next/headers";
import ClientSession from "./ClientSession";
import postServerRequest from "@/services/http/serverRequestService";

export { Session };

async function Session({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const cookieStore = cookies();
  const hasSessionID = cookieStore.has("sessionID");

  if (!hasSessionID) {
    initCreateSession(params.id);
    return;
  }

  const response = await postServerRequest("/session/getsession", {});

  if (!response.ok) initCreateSession(params.id);

  return <ClientSession params={params}>{children}</ClientSession>;
}

function initCreateSession(callBackID: string) {
  redirect("/createsession?callback=" + callBackID);
}
