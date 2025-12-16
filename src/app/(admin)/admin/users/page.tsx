import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Admin | TalkifyDocs",
  description: "Manage users, tiers, and permissions",
};

interface PageProps {
  searchParams: {
    page?: string;
  };
}

export default async function UsersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const page = parseInt(searchParams.page || "1", 10);
  const limit = 50;

  const [users, total] = await Promise.all([
    db.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { files: true, messages: true },
        },
      },
    }),
    db.user.count(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-display-lg mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text font-bold text-transparent">
              User Management
            </h1>
            <p className="text-body-lg text-gray-600 dark:text-gray-300">
              Manage user accounts, tiers, and permissions
            </p>
          </div>
          <div className="text-sm text-muted-foreground">Total: {total} users</div>
        </div>

        <UserManagementTable
          users={users}
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
        />
      </div>
    </div>
  );
}
