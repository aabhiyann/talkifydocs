"use client";

import {
  ModernCard,
  ModernCardContent,
  ModernCardHeader,
  ModernCardTitle,
} from "@/components/ui/modern-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users } from "lucide-react";
import { memo } from "react";
import { UserTable, type User } from "./UserTable";

interface RecentUsersTableProps {
  users: User[];
}

export const RecentUsersTable = memo(({ users }: RecentUsersTableProps) => {
  return (
    <ModernCard>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Users
          </ModernCardTitle>
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              View All
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        <UserTable users={users} showActions={false} />
      </ModernCardContent>
    </ModernCard>
  );
});

RecentUsersTable.displayName = "RecentUsersTable";
