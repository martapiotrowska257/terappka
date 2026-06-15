import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function RoleRouter() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const roles = session.user?.roles || [];

  if (roles.includes("admin")) {
    redirect("/admin");
  } else if (roles.includes("therapist")) {
    redirect("/terapeuta");
  } else {
    redirect("/pacjent");
  }
}
