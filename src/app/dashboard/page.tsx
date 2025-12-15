import Dashboard from "@/components/dashboard";
import { getCurrentUser } from "@/lib/auth";

const Page = async () => {
  // Middleware already protects this route
  // getCurrentUser will create the user in DB if they don't exist (via upsert)
  // If it returns null, middleware should have caught it, but we'll handle gracefully
  const user = await getCurrentUser();
  
  // If user is null, something went wrong - but don't redirect here
  // Let middleware handle authentication redirects to avoid loops
  // The Dashboard component should handle the null case gracefully
  return <Dashboard />;
};

export default Page;
