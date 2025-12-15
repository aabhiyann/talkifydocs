import Dashboard from "@/components/dashboard";
import { db } from "@/db";
import { requireUser } from "@/lib/auth";

const Page = async () => {
  const user = await requireUser();

  return <Dashboard />;
};

export default Page;
