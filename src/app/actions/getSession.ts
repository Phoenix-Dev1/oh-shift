import { getServerSession } from "next-auth";
import { authOptions } from "../../app/libs/authOtions";

export default async function getSession() {
  return await getServerSession(authOptions);
}
