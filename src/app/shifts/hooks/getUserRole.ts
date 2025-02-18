import getCurrentUser from "../../actions/getCurrentUser";

export default async function getUserRole() {
  const user = await getCurrentUser();
  const userRole = user?.role;
  return userRole;
}
