import Dashboard from "@/components/dashboard";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {
  // Use getCurrentUser instead of requireUser to avoid redirect loops
  // Middleware already protects this route
  const user = await getCurrentUser();
  
  // If user doesn't exist, redirect to sign-in
  // This should rarely happen as middleware protects the route
  if (!user) {
    redirect("/sign-in");
  }

  return <Dashboard />;
};

export default Page;
