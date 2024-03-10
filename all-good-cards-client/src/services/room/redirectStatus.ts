import { redirect } from "next/navigation";

export default async function redirectFromStatus(
  currentStatus: number,
  roomID: string,
  resBody: any
) {
  const statusMeaning = ["/options", "/waiting", "/judge", "/player"];

  if (currentStatus === resBody.status) return;
  redirect("/room/" + roomID + statusMeaning[resBody.status]);
}
