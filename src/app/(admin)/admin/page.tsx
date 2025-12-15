import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const AdminPage = async () => {
  const user = await requireUser();

  if (user.tier !== "ADMIN") {
    // Non-admins are redirected away from admin routes
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-display-md font-semibold text-secondary-900 dark:text-secondary-50">
          Admin Dashboard
        </h1>
        <p className="text-body-lg text-secondary-600 dark:text-secondary-300">
          This page is protected by role-based access control. Only users with
          the <span className="font-semibold">ADMIN</span> tier can view it.
        </p>
        <div className="rounded-xl border border-secondary-200 bg-background/60 p-6 shadow-sm dark:border-secondary-800 dark:bg-secondary-900/40">
          <p className="text-body-md text-secondary-700 dark:text-secondary-200">
            Use this area to add admin-only tools such as user management,
            billing overrides, and system monitoring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;


