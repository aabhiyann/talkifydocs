"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Crown, User as UserIcon, Trash2, Loader2 } from "lucide-react";
import { memo } from "react";
import { formatDate } from "@/lib/utils/formatters";

export interface User {
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

interface UserTableProps {
  users: User[];
  isLoading?: boolean;
  showActions?: boolean;
  onTierChange?: (userId: string, newTier: "FREE" | "PRO" | "ADMIN") => void;
  onDelete?: (userId: string, userEmail: string) => void;
}

interface UserRowProps {
  user: User;
  isLoading: boolean;
  showActions: boolean;
  onTierChange?: (userId: string, newTier: "FREE" | "PRO" | "ADMIN") => void;
  onDelete?: (userId: string, userEmail: string) => void;
}

const UserRow = memo(({ user, isLoading, showActions, onTierChange, onDelete }: UserRowProps) => {
  return (
    <tr className="hover:bg-muted/50 border-b transition-colors">
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
        {formatDate(user.createdAt)}
      </td>
      {showActions && (
        <td className="px-4 py-3">
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-xs font-semibold">Change Tier</div>
                <DropdownMenuItem
                  onClick={() => onTierChange?.(user.id, "FREE")}
                  disabled={user.tier === "FREE" || isLoading}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Free
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onTierChange?.(user.id, "PRO")}
                  disabled={user.tier === "PRO" || isLoading}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Pro
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onTierChange?.(user.id, "ADMIN")}
                  disabled={user.tier === "ADMIN" || isLoading}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(user.id, user.email)}
                  disabled={isLoading}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      )}
    </tr>
  );
});

UserRow.displayName = "UserRow";

export const UserTable = memo(({ 
  users, 
  isLoading = false, 
  showActions = false, 
  onTierChange, 
  onDelete 
}: UserTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Tier</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Files</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Messages</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
            {showActions && <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 6 : 5} className="py-8 text-center text-muted-foreground">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isLoading={isLoading}
                showActions={showActions}
                onTierChange={onTierChange}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

UserTable.displayName = "UserTable";
