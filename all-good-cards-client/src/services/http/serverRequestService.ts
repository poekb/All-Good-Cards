import { cookies } from "next/headers";

export default async function postServerRequest(route: string, body: any) {
  const cookieStore = cookies();

  const response = await fetch(process.env.LOCAL_SERVER_URL + route, {
    method: "POST",
    body: JSON.stringify({
      sessionID: cookieStore.get("sessionID")?.value,
      ...body,
    }),
    headers: {
      "content-type": "application/json",
      Accept: "application/json",
    },
  });

  return response;
}
