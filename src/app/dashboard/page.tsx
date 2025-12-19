import { Dashboard } from "@/components/dashboard";

const Page = async () => {
  // Middleware already protects this route
  return <Dashboard />;
};

export default Page;
