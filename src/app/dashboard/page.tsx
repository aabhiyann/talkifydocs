// import Dashboard from "@/components/dashboard";
import Dashboard from "@/components/dashboard";
import { db } from "@/db";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await requireUser().catch(() =>
    redirect("/auth-callback?origin=dashboard")
  );

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  return <Dashboard />;
};

export default Page;
