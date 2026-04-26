import { Dashboard } from "@/components/Dashboard";

const Page = async () => {
  // Middleware already protects this route
  return <Dashboard />;
};

export default Page;
