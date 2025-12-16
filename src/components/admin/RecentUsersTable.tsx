"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users } from "lucide-react";

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

interface RecentUsersTableProps {
  users: User[];
}

export function RecentUsersTable({ users }: RecentUsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Users
          </CardTitle>
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              View All
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  Tier
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  Files
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  Messages
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
