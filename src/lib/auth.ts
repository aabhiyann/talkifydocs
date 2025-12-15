import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export type AuthUser = {
  id: string;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return null;
  }

  return {
    id: user.id,
    // Kinde user objects expose email as `email` in this project
    email: (user as any).email ?? null,
    givenName: (user as any).given_name ?? null,
    familyName: (user as any).family_name ?? null,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return user;
}


