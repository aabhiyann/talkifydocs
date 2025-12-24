import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentUsersTable } from "@/components/admin/RecentUsersTable";
import { SystemMetrics } from "@/components/admin/SystemMetrics";
import { ErrorLogViewer } from "@/components/admin/ErrorLogViewer";
import { createServerClient } from "@/trpc/server";
import { Users, FileText, MessageSquare, Crown } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();

  // Fetch stats
  const [totalUsers, totalFiles, totalMessages, proUsers] = await Promise.all([
    db.user.count(),
    db.file.count(),
    db.message.count(),
    db.user.count({ where: { tier: "PRO" } }),
  ]);

  // Recent users
  const recentUsers = await db.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { files: true, messages: true },
      },
    },
  });

  // System metrics
  const serverClient = await createServerClient();
  const metrics = await serverClient.getSystemMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-display-lg mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text font-bold text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300">
            System overview, user management, and monitoring
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={totalUsers}
            change="+12%"
            trend="up"
            icon={<Users className="h-5 w-5" />}
          />
          <StatsCard
            title="Pro Users"
            value={proUsers}
            change="+8%"
            trend="up"
            icon={<Crown className="h-5 w-5" />}
          />
          <StatsCard
            title="Documents"
            value={totalFiles}
            change="+23%"
            trend="up"
            icon={<FileText className="h-5 w-5" />}
          />
          <StatsCard
            title="Messages"
            value={totalMessages}
            change="+45%"
            trend="up"
            icon={<MessageSquare className="h-5 w-5" />}
          />
        </div>

        {/* System Metrics and Error Logs */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <SystemMetrics initialMetrics={metrics} />
          <ErrorLogViewer />
        </div>

        {/* Recent Users */}
        <RecentUsersTable users={recentUsers} />
      </div>
    </div>
  );
}
