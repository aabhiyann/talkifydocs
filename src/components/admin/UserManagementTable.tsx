"use client";

import {
  ModernCard,
  ModernCardContent,
} from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { useToastOptions } from "@/hooks/useToastMutation";
import { UserTable, type User } from "./UserTable";
import { useToast } from "@/components/ui/use-toast";

interface UserManagementTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
}

export const UserManagementTable = memo(({
  users,
  currentPage,
  totalPages,
}: UserManagementTableProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: updateUserTier, isLoading: isUpdatingTier } = 
    trpc.updateUserTier.useMutation(
      useToastOptions({
        successTitle: "User tier updated",
        refreshOnSuccess: true,
      })
    );

  const { mutate: deleteUser, isLoading: isDeletingUser } = 
    trpc.deleteUser.useMutation(
      useToastOptions({
        successTitle: "User deleted",
        successDescription: "User has been deleted",
      })
    );

  const handleTierChange = useCallback((userId: string, newTier: "FREE" | "PRO" | "ADMIN") => {
    updateUserTier({ userId, tier: newTier });
  }, [updateUserTier]);

  const handleDelete = useCallback((userId: string, userEmail: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user ${userEmail}? This will delete all their files, messages, and conversations. This action cannot be undone.`,
      )
    ) {
      return;
    }
    deleteUser({ userId });
  }, [deleteUser]);

  const handleExportCSV = () => {
    const headers = ["Email", "Name", "Tier", "Files", "Messages", "Joined"];
    const rows = users.map((user) => [
      user.email,
      user.name || "",
      user.tier,
      user._count.files.toString(),
      user._count.messages.toString(),
      format(new Date(user.createdAt), "yyyy-MM-dd"),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export started",
      description: "User data has been exported as CSV",
    });
  };

  const isLoading = isUpdatingTier || isDeletingUser;

  return (
    <ModernCard padding="none">
      <ModernCardContent>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Users</h2>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
        
        <UserTable 
          users={users}
          isLoading={isLoading}
          showActions={true}
          onTierChange={handleTierChange}
          onDelete={handleDelete}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => router.push(`/admin/users?page=${currentPage - 1}`)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => router.push(`/admin/users?page=${currentPage + 1}`)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
});

UserManagementTable.displayName = "UserManagementTable";
