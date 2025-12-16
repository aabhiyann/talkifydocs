"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Crown, User, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateUserTier, deleteUser } from "@/actions/admin";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  tier: "FREE" | "PRO" | "ADMIN";
  createdAt: Date | string;
  _count: {
    files: number;
    messages: number;
  };
}

interface UserManagementTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
}

export function UserManagementTable({ users, currentPage, totalPages }: UserManagementTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleTierChange = async (userId: string, newTier: "FREE" | "PRO" | "ADMIN") => {
    setUpdating(userId);
    try {
      await updateUserTier(userId, newTier);
      toast({
        title: "User tier updated",
        description: `User tier changed to ${newTier}`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error updating tier",
        description: error instanceof Error ? error.message : "Failed to update user tier",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user ${userEmail}? This will delete all their files, messages, and conversations. This action cannot be undone.`,
      )
    ) {
      return;
    }

    setUpdating(userId);
    try {
      await deleteUser(userId);
      toast({
        title: "User deleted",
        description: `User ${userEmail} has been deleted`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error deleting user",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

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

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Users</h2>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tier</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Files</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Messages</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 border-b transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{user.name || "Anonymous"}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.tier === "ADMIN"
                            ? "default"
                            : user.tier === "PRO"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {user.tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{user._count.files}</td>
                    <td className="px-4 py-3 text-sm">{user._count.messages}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={updating === user.id}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <div className="px-2 py-1.5 text-xs font-semibold">Change Tier</div>
                            <DropdownMenuItem
                              onClick={() => handleTierChange(user.id, "FREE")}
                              disabled={user.tier === "FREE" || updating === user.id}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Free
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTierChange(user.id, "PRO")}
                              disabled={user.tier === "PRO" || updating === user.id}
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              Pro
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTierChange(user.id, "ADMIN")}
                              disabled={user.tier === "ADMIN" || updating === user.id}
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              Admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(user.id, user.email)}
                              disabled={updating === user.id}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
      </CardContent>
    </Card>
  );
}
